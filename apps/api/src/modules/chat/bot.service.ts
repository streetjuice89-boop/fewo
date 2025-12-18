import { Injectable } from '@nestjs/common';

interface BotResponse {
  answer: string;
  shouldEscalate: boolean;
}

interface FAQEntry {
  keywords: string[];
  answerDe: string;
  answerEn: string;
}

@Injectable()
export class BotService {
  private faqDatabase: FAQEntry[] = [
    {
      keywords: ['buchen', 'buchung', 'reservieren', 'book', 'booking', 'reserve'],
      answerDe:
        'Um eine Unterkunft zu buchen, wählen Sie einfach Ihre gewünschte Ferienwohnung aus, geben Sie Ihre Reisedaten ein und folgen Sie dem Buchungsprozess. Sie erhalten eine Bestätigung per E-Mail.',
      answerEn:
        'To book an accommodation, simply select your desired vacation rental, enter your travel dates, and follow the booking process. You will receive a confirmation by email.',
    },
    {
      keywords: ['stornieren', 'stornierung', 'absagen', 'cancel', 'cancellation'],
      answerDe:
        'Stornierungen sind je nach Buchungsbedingungen möglich. In der Regel können Sie bis 14 Tage vor Anreise kostenlos stornieren. Für detaillierte Informationen kontaktieren Sie uns bitte.',
      answerEn:
        'Cancellations are possible depending on booking conditions. Generally, you can cancel free of charge up to 14 days before arrival. For detailed information, please contact us.',
    },
    {
      keywords: ['check-in', 'anreise', 'eincheck', 'arrival', 'checkin'],
      answerDe:
        'Der Check-in ist in der Regel ab 15:00 Uhr möglich. Die genauen Details und den Schlüsselübergabe-Prozess erhalten Sie in Ihrer Buchungsbestätigung.',
      answerEn:
        'Check-in is generally possible from 3:00 PM. You will receive the exact details and key handover process in your booking confirmation.',
    },
    {
      keywords: ['check-out', 'abreise', 'auscheck', 'departure', 'checkout'],
      answerDe:
        'Der Check-out erfolgt bis 10:00 Uhr am Abreisetag. Bitte hinterlassen Sie die Unterkunft in einem ordentlichen Zustand.',
      answerEn:
        'Check-out is by 10:00 AM on the departure day. Please leave the accommodation in a tidy condition.',
    },
    {
      keywords: ['bezahlen', 'zahlung', 'payment', 'pay', 'credit', 'kreditkarte'],
      answerDe:
        'Wir akzeptieren verschiedene Zahlungsmethoden: Kreditkarte (Visa, Mastercard), PayPal und Banküberweisung. Die Zahlung erfolgt bei der Buchung.',
      answerEn:
        'We accept various payment methods: Credit card (Visa, Mastercard), PayPal, and bank transfer. Payment is due at the time of booking.',
    },
    {
      keywords: ['kontakt', 'telefon', 'email', 'contact', 'phone', 'reach'],
      answerDe:
        'Sie erreichen uns per E-Mail unter info@voyagenest.com oder telefonisch unter +49 123 456789. Unser Team ist Mo-Fr von 9-18 Uhr für Sie da.',
      answerEn:
        'You can reach us by email at info@voyagenest.com or by phone at +49 123 456789. Our team is available Mon-Fri from 9 AM to 6 PM.',
    },
    {
      keywords: ['haustier', 'hund', 'katze', 'pet', 'dog', 'cat', 'animal'],
      answerDe:
        'Haustiere sind in einigen unserer Unterkünfte erlaubt. Bitte prüfen Sie die jeweilige Objektbeschreibung oder kontaktieren Sie uns für spezifische Anfragen.',
      answerEn:
        'Pets are allowed in some of our accommodations. Please check the respective property description or contact us for specific inquiries.',
    },
    {
      keywords: ['wifi', 'wlan', 'internet', 'network'],
      answerDe:
        'Alle unsere Unterkünfte verfügen über kostenloses WLAN. Die Zugangsdaten finden Sie in der Unterkunft oder in Ihrer Buchungsbestätigung.',
      answerEn:
        'All our accommodations have free WiFi. You will find the access details in the accommodation or in your booking confirmation.',
    },
    {
      keywords: ['preis', 'kosten', 'price', 'cost', 'rate', 'fee'],
      answerDe:
        'Die Preise variieren je nach Unterkunft, Saison und Aufenthaltsdauer. Alle Preise werden transparent auf der jeweiligen Objektseite angezeigt.',
      answerEn:
        'Prices vary depending on the accommodation, season, and length of stay. All prices are transparently displayed on the respective property page.',
    },
  ];

  /**
   * Process user message and return bot response
   */
  processMessage(message: string, locale: 'de' | 'en' = 'de'): BotResponse {
    const normalizedMessage = message.toLowerCase().trim();

    // Greeting detection
    if (this.isGreeting(normalizedMessage)) {
      return {
        answer:
          locale === 'de'
            ? 'Hallo! Willkommen bei VoyageNest. Wie kann ich Ihnen helfen? Sie können mich zu Buchungen, Stornierungen, Check-in/Check-out Zeiten oder Zahlungsmöglichkeiten fragen.'
            : 'Hello! Welcome to VoyageNest. How can I help you? You can ask me about bookings, cancellations, check-in/check-out times, or payment options.',
        shouldEscalate: false,
      };
    }

    // Search for matching FAQ
    for (const faq of this.faqDatabase) {
      if (faq.keywords.some((keyword) => normalizedMessage.includes(keyword))) {
        return {
          answer: locale === 'de' ? faq.answerDe : faq.answerEn,
          shouldEscalate: false,
        };
      }
    }

    // No match found - offer escalation
    return {
      answer:
        locale === 'de'
          ? 'Entschuldigung, ich konnte keine passende Antwort finden. Möchten Sie mit einem Mitarbeiter sprechen? Tippen Sie "Agent" oder "Mitarbeiter" um verbunden zu werden.'
          : 'Sorry, I could not find a suitable answer. Would you like to speak with a team member? Type "Agent" or "Staff" to be connected.',
      shouldEscalate: this.wantsHumanAgent(normalizedMessage),
    };
  }

  /**
   * Check if user wants human agent
   */
  wantsHumanAgent(message: string): boolean {
    const agentKeywords = [
      'agent',
      'mitarbeiter',
      'mensch',
      'human',
      'staff',
      'person',
      'support',
      'hilfe',
      'help',
      'sprechen',
      'talk',
    ];
    return agentKeywords.some((keyword) => message.toLowerCase().includes(keyword));
  }

  /**
   * Check if message is a greeting
   */
  private isGreeting(message: string): boolean {
    const greetings = [
      'hallo',
      'hi',
      'hey',
      'guten tag',
      'guten morgen',
      'guten abend',
      'hello',
      'good morning',
      'good evening',
      'moin',
      'servus',
    ];
    return greetings.some((greeting) => message.includes(greeting));
  }
}

