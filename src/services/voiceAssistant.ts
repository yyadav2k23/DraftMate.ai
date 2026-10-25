import { VoiceAssistantMessage } from '../types';

export interface VoiceCapabilities {
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  speechRecognitionEngine: string;
}

export class VoiceAssistantService {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static currentTranscript: string = '';

  public static getCapabilities(): VoiceCapabilities {
    const hasSpeechRecognition =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const hasSpeechSynthesis =
      typeof window !== 'undefined' && 'speechSynthesis' in window;

    return {
      hasSpeechRecognition,
      hasSpeechSynthesis,
      speechRecognitionEngine: hasSpeechRecognition
        ? 'Browser Native Web Speech API'
        : 'Unsupported in current browser environment (Text input active)',
    };
  }

  public static startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError('Web Speech API is not supported in this browser. Please use keyboard text chat.');
      return false;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN'; // Indian English legal terminology

      rec.onstart = () => {
        this.isListening = true;
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        onTranscript(final || interim, Boolean(final));
      };

      rec.onerror = (event: any) => {
        this.isListening = false;
        onError(`Microphone error: ${event.error || 'Permission denied or audio capture failure'}`);
      };

      rec.onend = () => {
        this.isListening = false;
        onEnd();
      };

      rec.start();
      this.recognition = rec;
      return true;
    } catch (e: any) {
      this.isListening = false;
      onError(`Could not start speech recognition: ${e.message}`);
      return false;
    }
  }

  public static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.isListening = false;
  }

  public static speakText(text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      if (onEnd) {
        utterance.onend = onEnd;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech synthesis failed', e);
      return false;
    }
  }

  public static stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Generates helpful, evidence-grounded legal responses for common Indian legal inquiries.
   */
  public static generateAssistantResponse(query: string): VoiceAssistantMessage {
    const q = query.toLowerCase();
    let text = '';
    const citations: string[] = [];

    if (q.includes('15 day') || q.includes('statutory deadline') || q.includes('statutory period')) {
      text =
        'In Indian commercial law, there is NO universal statutory 15-day response requirement for general contract recovery notices. Section 73 of the Indian Contract Act provides compensation for breach of contract, but does not legislate a 15-day deadline. A 15-day cure window is a customary demand period, unless dealing with dishonoured cheques under Section 138 of the Negotiable Instruments Act where a 15-day payment window is indeed statutorily mandated.';
      citations.push('Indian Contract Act, 1872 (Section 73)', 'Negotiable Instruments Act, 1881 (Section 138)');
    } else if (q.includes('section 73') || q.includes('contract act') || q.includes('breach')) {
      text =
        'Section 73 of the Indian Contract Act, 1872 entitles a party suffering from breach of contract to receive compensation for any loss or damage naturally arising in the usual course of things. Notably, Section 73 specifically prohibits compensation for remote and indirect losses, and does not permit arbitrary penalties without actual proof of damage.';
      citations.push('Indian Contract Act, 1872 (Section 73)');
    } else if (q.includes('order 37') || q.includes('order xxxvii') || q.includes('summary')) {
      text =
        'Order XXXVII of the Code of Civil Procedure, 1908 governs Summary Suits. It does not automatically apply to every commercial debt dispute. It is confined to specified courts and liquidated demands founded on written contracts, bills of exchange, hundis, or promissory notes where no complex factual trials are needed.';
      citations.push('Code of Civil Procedure, 1908 (Order XXXVII)');
    } else if (q.includes('electronic record') || q.includes('65b') || q.includes('bsa') || q.includes('evidence')) {
      text =
        'Regarding digital evidence in Indian courts: The Bharatiya Sakshya Adhiniyam, 2023 (BSA) came into force on 1 July 2024, replacing the Indian Evidence Act, 1872. Admissibility of electronic records and emails is now governed under Section 63 of the BSA with the Schedule certificate, rather than legacy Section 65B.';
      citations.push('Bharatiya Sakshya Adhiniyam, 2023 (Section 63)');
    } else if (q.includes('contradiction') || q.includes('aster') || q.includes('payment')) {
      text =
        'When an audit identifies contradictory payment records—such as a warehouse delivery note indicating NEFT settlement versus a reconciliation ledger marking the invoice as pending—DraftMate.ai flags this as a Critical Contradiction. The system never decides which document is genuine; it requires financial reconciliation and human counsel verification before legal notice service.';
    } else {
      text = `I can provide informational analysis regarding Indian contract provisions, commercial demand drafting conventions, evidence admissibility under BSA 2023, and citation verification. Please note that I provide legal information, not formal legal advice. For actionable legal counsel, please consult an advocate enrolled with the Bar Council of India.`;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'ASSISTANT',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citationsReferenced: citations,
    };
  }
}
