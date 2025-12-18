'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button, Input, Spinner } from '@voyagenest/ui';
import { cn } from '@voyagenest/ui';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export function ChatWidget() {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content:
          locale === 'de'
            ? 'Hallo! Willkommen bei VoyageNest. Wie kann ich Ihnen heute helfen?'
            : 'Hello! Welcome to VoyageNest. How can I help you today?',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, locale, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue, locale);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (input: string, locale: string): string => {
    const lowerInput = input.toLowerCase();

    // Simple FAQ responses
    if (lowerInput.includes('buchen') || lowerInput.includes('book')) {
      return locale === 'de'
        ? 'Um eine Unterkunft zu buchen, wählen Sie einfach Ihre gewünschte Ferienwohnung aus und folgen Sie dem Buchungsprozess. Haben Sie eine bestimmte Unterkunft im Blick?'
        : 'To book an accommodation, simply select your desired property and follow the booking process. Do you have a specific property in mind?';
    }

    if (lowerInput.includes('stornieren') || lowerInput.includes('cancel')) {
      return locale === 'de'
        ? 'Stornierungen sind bis 14 Tage vor Anreise kostenlos möglich. Für weitere Details kontaktieren Sie uns bitte.'
        : 'Cancellations are free up to 14 days before arrival. For more details, please contact us.';
    }

    if (lowerInput.includes('preis') || lowerInput.includes('price') || lowerInput.includes('kosten')) {
      return locale === 'de'
        ? 'Die Preise variieren je nach Unterkunft und Saison. Alle Preise werden transparent auf den Objektseiten angezeigt.'
        : 'Prices vary depending on the property and season. All prices are transparently displayed on the property pages.';
    }

    if (lowerInput.includes('kontakt') || lowerInput.includes('contact') || lowerInput.includes('email')) {
      return locale === 'de'
        ? 'Sie erreichen uns per E-Mail unter info@voyagenest.com oder telefonisch unter +49 123 456789. Unser Team ist Mo-Fr von 9-18 Uhr für Sie da.'
        : 'You can reach us by email at info@voyagenest.com or by phone at +49 123 456789. Our team is available Mon-Fri from 9 AM to 6 PM.';
    }

    // Default response
    return locale === 'de'
      ? 'Vielen Dank für Ihre Nachricht. Kann ich Ihnen bei der Buchung einer Unterkunft helfen oder haben Sie Fragen zu unseren Services?'
      : 'Thank you for your message. Can I help you book an accommodation or do you have questions about our services?';
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-sunset shadow-sunset text-navy-deep',
          isOpen && 'hidden'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-navy-medium rounded-2xl shadow-card-hover border border-navy-light overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-navy-light bg-navy-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-sunset flex items-center justify-center">
                  <Bot className="h-5 w-5 text-navy-deep" />
                </div>
                <div>
                  <h3 className="font-ui font-semibold text-pearl">{t('title')}</h3>
                  <p className="text-xs text-ocean">{t('online')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-navy-medium transition-colors"
              >
                <X className="h-5 w-5 text-warm-gray" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.isBot ? 'justify-start' : 'justify-end'
                  )}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-ocean/20 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-ocean" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] p-3 rounded-2xl text-sm',
                      message.isBot
                        ? 'bg-navy-light text-pearl rounded-tl-none'
                        : 'bg-gradient-sunset text-navy-deep rounded-tr-none'
                    )}
                  >
                    {message.content}
                  </div>
                  {!message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-sunset/20 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-sunset" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-navy-light">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('placeholder')}
                  className="flex-1 bg-navy-light border-none rounded-xl px-4 py-2 text-pearl placeholder:text-warm-gray focus:ring-2 focus:ring-sunset text-sm"
                />
                <Button type="submit" size="sm" className="px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

