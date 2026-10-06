import {
  CurrentWeather,
  FieldData,
  HourlyForecastItem,
  RunoffCalculation,
  RiskLevel,
  PlannedActivityCheck,
  SuitabilityStatus,
} from '../types';

export function calculateFieldRunoffRisk(
  field: FieldData,
  weather: CurrentWeather,
  hourly: HourlyForecastItem[]
): RunoffCalculation {
  const reasons: string[] = [];

  // Factor 1: Forecast Precipitation in next 6 hours
  const next6Hours = hourly.slice(0, 6);
  const maxRainProb = Math.max(...next6Hours.map((h) => h.precipitationProbability), weather.rainProbability);
  const totalForecastMm = next6Hours.reduce((acc, h) => acc + h.precipitation, 0);

  let rainScore = 0;
  if (totalForecastMm > 15 || maxRainProb > 80) {
    rainScore = 40;
    reasons.push(
      `Heavy rainfall is forecast (${totalForecastMm.toFixed(1)} mm next 6h, peak rain probability ${maxRainProb}%).`
    );
  } else if (totalForecastMm > 5 || maxRainProb > 60) {
    rainScore = 25;
    reasons.push(
      `Rainfall probability is elevated (${maxRainProb}%) with ${totalForecastMm.toFixed(1)} mm predicted.`
    );
  } else if (totalForecastMm > 1 || maxRainProb > 35) {
    rainScore = 12;
    reasons.push(`Light scattered precipitation forecasted (${totalForecastMm.toFixed(1)} mm).`);
  } else {
    rainScore = 3;
    reasons.push(`Dry weather expected over the next 6-hour cultivation window.`);
  }

  // Factor 2: Soil moisture & recent rainfall
  let moistureScore = 0;
  if (field.estimatedSoilMoisturePercent >= 75) {
    moistureScore = 25;
    reasons.push(
      `Recent antecedent rainfall has saturated soil moisture to ${field.estimatedSoilMoisturePercent}%, severely reducing infiltration capacity.`
    );
  } else if (field.estimatedSoilMoisturePercent >= 60) {
    moistureScore = 16;
    reasons.push(
      `Soil moisture is moderately high (${field.estimatedSoilMoisturePercent}%), limiting rapid percolation.`
    );
  } else {
    moistureScore = 6;
    reasons.push(`Soil profile moisture is well within absorbent capacity (${field.estimatedSoilMoisturePercent}%).`);
  }

  // Factor 3: Topography & Slope
  let slopeScore = 0;
  if (field.slopePercentage >= 4.0) {
    slopeScore = 20;
    reasons.push(
      `Field slope of ${field.slopePercentage}% accelerates surface water velocity toward ${field.slopeDirection}.`
    );
  } else if (field.slopePercentage >= 2.0) {
    slopeScore = 12;
    reasons.push(
      `Gentle field slope (${field.slopePercentage}%) provides moderate drainage gradient toward ${field.slopeDirection}.`
    );
  } else {
    slopeScore = 5;
    reasons.push(`Flat field topography (${field.slopePercentage}% slope) minimizes overland flow velocity.`);
  }

  // Factor 4: Watershed Proximity
  let proximityScore = 0;
  if (field.distanceToWaterBodyMeters <= 80) {
    proximityScore = 15;
    reasons.push(
      `Close proximity (${field.distanceToWaterBodyMeters}m) to ${field.connectedWaterBody} places plot inside critical buffer zone.`
    );
  } else if (field.distanceToWaterBodyMeters <= 150) {
    proximityScore = 9;
    reasons.push(
      `Field is within secondary catchment drainage zone (${field.distanceToWaterBodyMeters}m from ${field.connectedWaterBody}).`
    );
  } else {
    proximityScore = 3;
    reasons.push(`Adequate natural buffer distance (${field.distanceToWaterBodyMeters}m) from nearest open water body.`);
  }

  const totalScore = Math.min(100, rainScore + moistureScore + slopeScore + proximityScore);

  let overallRisk: RiskLevel = 'LOW';
  let recommendation = 'Field hydrological conditions are stable for normal operations.';

  if (totalScore >= 75) {
    overallRisk = 'VERY_HIGH';
    recommendation =
      'CRITICAL: Postpone all chemical spray and broadcast fertilizer applications. High overland flow hazard.';
  } else if (totalScore >= 50) {
    overallRisk = 'HIGH';
    recommendation =
      'CAUTION: Avoid agrochemical applications before forecasted rain window. Maintain vegetative filter strips.';
  } else if (totalScore >= 30) {
    overallRisk = 'MODERATE';
    recommendation =
      'MODERATE RISK: Check soil surface before applying nutrients. Avoid application if heavy clouds gather.';
  } else {
    overallRisk = 'LOW';
    recommendation =
      'FAVORABLE: Hydrological conditions are optimal for planned field activities and precision inputs.';
  }

  return {
    overallRisk,
    riskScore: totalScore,
    reasons,
    factors: {
      rainfallProbability: maxRainProb,
      forecastPrecipitationMm: totalForecastMm,
      recentRainfallMm: weather.recentRainfall24h,
      soilMoisturePercent: field.estimatedSoilMoisturePercent,
      slopeScore,
      watershedProximityScore: proximityScore,
    },
    recommendation,
    calculatedAt: Date.now(),
    isLive: weather.isLive,
  };
}

export function evaluateBeforeYouApply(
  activityType: 'fertilizer' | 'pesticide' | 'irrigation' | 'tillage',
  plannedHourOffset: number,
  field: FieldData,
  hourly: HourlyForecastItem[],
  currentWeather: CurrentWeather
): PlannedActivityCheck {
  const targetHour = hourly[plannedHourOffset] || hourly[0];
  const targetTimeLabel = targetHour.time;
  const targetRainProb = targetHour.precipitationProbability;
  const targetRainMm = targetHour.precipitation;
  const targetWindSpeed = targetHour.windSpeed;

  const next4Hours = hourly.slice(plannedHourOffset, plannedHourOffset + 4);
  const rainIn4HoursMm = next4Hours.reduce((sum, h) => sum + h.precipitation, 0);
  const maxRainProb4h = Math.max(...next4Hours.map((h) => h.precipitationProbability), targetRainProb);

  const reasons: string[] = [];
  let suitability: SuitabilityStatus = 'SUITABLE';
  let headline = 'Conditions appear suitable for planned activity.';
  let alternativeWindow: string | undefined;

  const disclaimer =
    'Follow product label instructions and local agricultural guidance. AgroShield estimates hydrological runoff potential only.';

  if (activityType === 'fertilizer') {
    if (rainIn4HoursMm >= 5 || maxRainProb4h >= 70 || field.estimatedSoilMoisturePercent >= 75) {
      suitability = 'HIGH_CAUTION';
      headline = 'Unfavorable conditions for fertilizer application.';
      reasons.push(
        `High probability of rainfall (${maxRainProb4h}%, ${rainIn4HoursMm.toFixed(1)} mm) within 4 hours of application.`
      );
      reasons.push(
        `Surface runoff risks leaching valuable nitrogen and phosphorus into ${field.connectedWaterBody}.`
      );
      if (field.estimatedSoilMoisturePercent >= 75) {
        reasons.push(`Soil saturation (${field.estimatedSoilMoisturePercent}%) will prevent root zone absorption.`);
      }
      alternativeWindow = 'Look for a window with < 30% rain probability for at least 24 hours.';
    } else if (rainIn4HoursMm >= 2 || maxRainProb4h >= 45) {
      suitability = 'CAUTION';
      headline = 'Proceed with caution: moderate runoff potential.';
      reasons.push(
        `Scattered rain predicted (${maxRainProb4h}% chance). Top-dressing without incorporation may experience wash-off.`
      );
      reasons.push(`Ensure soil incorporation or banded placement rather than broad surface broadcast.`);
      alternativeWindow = 'Consider waiting until rain threat passes.';
    } else {
      suitability = 'SUITABLE';
      headline = 'Favorable weather window for fertilizer application.';
      reasons.push(`Low rain probability (${targetRainProb}%) during application and settling period.`);
      reasons.push(`Soil moisture (${field.estimatedSoilMoisturePercent}%) is receptive for nutrient uptake.`);
    }
  } else if (activityType === 'pesticide') {
    if (targetWindSpeed >= 18 || rainIn4HoursMm >= 2 || maxRainProb4h >= 60) {
      suitability = 'HIGH_CAUTION';
      headline = 'High drift & wash-off risk for crop protection.';
      if (targetWindSpeed >= 18) {
        reasons.push(
          `Wind speed (${targetWindSpeed} km/h) exceeds safe spraying threshold (max 15 km/h), causing off-target drift.`
        );
      }
      if (rainIn4HoursMm >= 2 || maxRainProb4h >= 60) {
        reasons.push(`Rainfall forecast within 4 hours will wash off foliar residues before absorption.`);
      }
      reasons.push(`High risk of drift contaminating nearby ${field.connectedWaterBody} (${field.distanceToWaterBodyMeters}m away).`);
      alternativeWindow = 'Spray during calm early morning hours (< 10 km/h wind) with clear skies.';
    } else if (targetWindSpeed >= 12 || maxRainProb4h >= 35) {
      suitability = 'CAUTION';
      headline = 'Moderate spray conditions: adhere to drift reduction.';
      reasons.push(`Wind speed is ${targetWindSpeed} km/h. Use drift-reduction nozzles and lower boom height.`);
      reasons.push(`Monitor approaching cloud systems.`);
    } else {
      suitability = 'SUITABLE';
      headline = 'Ideal spray conditions for crop protection.';
      reasons.push(`Calm wind (${targetWindSpeed} km/h) minimizes spray drift.`);
      reasons.push(`Clear forecast (${targetRainProb}% rain) provides required rainfast drying time.`);
    }
  } else if (activityType === 'irrigation') {
    if (rainIn4HoursMm >= 6 || maxRainProb4h >= 65 || field.estimatedSoilMoisturePercent >= 70) {
      suitability = 'HIGH_CAUTION';
      headline = 'Irrigation not recommended: rainfall imminent.';
      reasons.push(
        `Forecast indicates ${rainIn4HoursMm.toFixed(1)} mm of rain (${maxRainProb4h}% probability). Save water and power.`
      );
      reasons.push(`Adding irrigation will saturate soil to 100% capacity, causing severe field waterlogging.`);
      alternativeWindow = 'Rely on forecasted rainfall and recheck soil moisture tomorrow.';
    } else if (field.estimatedSoilMoisturePercent >= 60) {
      suitability = 'CAUTION';
      headline = 'Optional light irrigation only.';
      reasons.push(`Soil moisture is currently at ${field.estimatedSoilMoisturePercent}%. Deep irrigation is unneeded.`);
    } else {
      suitability = 'SUITABLE';
      headline = 'Irrigation recommended.';
      reasons.push(`Soil moisture is ${field.estimatedSoilMoisturePercent}%. Dry weather ahead allows controlled irrigation.`);
    }
  } else {
    // Tillage or other
    if (rainIn4HoursMm >= 8 || field.estimatedSoilMoisturePercent >= 80) {
      suitability = 'HIGH_CAUTION';
      headline = 'Unfavorable for tractor/heavy equipment movement.';
      reasons.push(`Wet soil will cause severe soil compaction and tire rutting.`);
    } else {
      suitability = 'SUITABLE';
      headline = 'Soil conditions suitable for field operations.';
      reasons.push(`Workability index is favorable.`);
    }
  }

  return {
    activityType,
    plannedTimestamp: targetHour.timestamp,
    plannedDateTimeString: targetTimeLabel,
    suitability,
    headline,
    reasons,
    alternativeWindow,
    disclaimer,
  };
}
