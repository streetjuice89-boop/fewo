import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: 'Willkommen bei VoyageNest! Wie kann ich Ihnen helfen?', isUser: false }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: 'Vielen Dank für Ihre Nachricht. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden.', 
        isUser: false 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-sunset-orange rounded-full flex items-center justify-center shadow-lg hover:bg-sunset-amber transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle className="w-6 h-6 text-navy-deep" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-navy-medium border border-navy-light rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-sunset-orange p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-deep/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-navy-deep" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-deep">VoyageNest Support</h3>
                  <p className="text-xs text-navy-deep/70">Wir sind online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-navy-deep hover:text-navy-medium">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.isUser 
                      ? 'bg-sunset-orange text-navy-deep' 
                      : 'bg-navy-light text-pearl'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-navy-light">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 px-4 py-2 bg-navy-light border border-navy-light rounded-full text-pearl text-sm focus:outline-none focus:ring-2 focus:ring-sunset-orange"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 bg-sunset-orange rounded-full flex items-center justify-center hover:bg-sunset-amber transition-colors"
                >
                  <Send className="w-4 h-4 text-navy-deep" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}




