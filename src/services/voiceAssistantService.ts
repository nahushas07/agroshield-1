import { VoiceMessage, FieldData, CurrentWeather, RunoffCalculation, SoilTestReport, GeoCoordinates } from '../types';

export class VoiceAssistantService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: 'en' | 'kn' | 'hi' = 'en';
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStateChangeCallback: ((state: 'idle' | 'listening' | 'processing' | 'speaking') => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser environment.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.updateLanguageSetting();

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStateChangeCallback?.('listening');
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      this.onResultCallback?.(text, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      this.onStateChangeCallback?.('idle');
      this.onErrorCallback?.(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Do not reset state to idle if we moved to processing
    };
  }

  public setLanguage(lang: 'en' | 'kn' | 'hi') {
    this.currentLanguage = lang;
    this.updateLanguageSetting();
  }

  private updateLanguageSetting() {
    if (!this.recognition) return;
    if (this.currentLanguage === 'kn') {
      this.recognition.lang = 'kn-IN';
    } else if (this.currentLanguage === 'hi') {
      this.recognition.lang = 'hi-IN';
    } else {
      this.recognition.lang = 'en-IN';
    }
  }

  public isSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onStateChange: (state: 'idle' | 'listening' | 'processing' | 'speaking') => void
  ) {
    this.stopSpeaking(); // Barge-in: interrupt ongoing speech
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onStateChangeCallback = onStateChange;

    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        onError('Voice speech recognition is not supported in this browser.');
        return;
      }
    }

    try {
      this.recognition.abort();
      this.recognition.start();
    } catch (e: any) {
      console.warn('Recognition start caught error:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
    }
    this.isListening = false;
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.onStateChangeCallback?.('idle');
  }

  public speakResponse(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    this.onStateChangeCallback?.('speaking');

    // Clean markdown asterisks or code formatting for cleaner speech synthesis
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (this.currentLanguage === 'kn') {
      utterance.lang = 'kn-IN';
    } else if (this.currentLanguage === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // Farmer-friendly, slightly measured pace
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.onStateChangeCallback?.('idle');
      onEnd?.();
    };

    utterance.onerror = () => {
      this.onStateChangeCallback?.('idle');
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public async askAssistant(
    prompt: string,
    context: {
      fieldData?: FieldData;
      weatherData?: CurrentWeather;
      runoffData?: RunoffCalculation;
      soilReport?: SoilTestReport;
      locationData?: GeoCoordinates | null;
    },
    history: VoiceMessage[] = []
  ): Promise<{ reply: string; toolUsed: string; grounded: boolean }> {
    this.onStateChangeCallback?.('processing');

    try {
      const res = await fetch('/api/ask-agroshield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language: this.currentLanguage,
          history,
          fieldData: context.fieldData,
          weatherData: context.weatherData,
          runoffData: context.runoffData,
          soilReport: context.soilReport,
          locationData: context.locationData,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      // Fallback response if fetch fails
      const fallback =
        this.currentLanguage === 'kn'
          ? 'ಕ್ಷಮಿಸಿ, ಜಾಲಬಂಧ ಸಮಸ್ಯೆಯಾಗಿದೆ. ಮಳೆ ಮತ್ತು ಹರಿವಿನ ದತ್ತಾಂಶವನ್ನು ಮುಖಪುಟದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.'
          : this.currentLanguage === 'hi'
          ? 'क्षमा करें, नेटवर्क में त्रुटि है। मुख्य पृष्ठ पर वर्षा और बहाव की जानकारी देखें।'
          : 'Network unavailable. Please review the live weather and runoff clock on your field dashboard.';
      return {
        reply: fallback,
        toolUsed: 'Offline Fallback',
        grounded: false,
      };
    }
  }
}

export const voiceAssistantService = new VoiceAssistantService();
