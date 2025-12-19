import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = (all: boolean) => {
    localStorage.setItem('cookie_consent', all ? 'all' : 'essential');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto bg-navy-medium border border-navy-light rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-navy-light flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-sunset-orange" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-pearl mb-2">Cookie-Einstellungen</h3>
                <p className="text-sm text-warm-gray mb-4">
                  Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                  Einige Cookies sind für die Funktion der Website erforderlich, während andere uns helfen, 
                  die Nutzung zu analysieren und zu verbessern.
                </p>
                <a href="/datenschutz" className="text-sm text-sunset-orange hover:underline">
                  Mehr erfahren
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleAccept(false)}
                  className="px-5 py-2 border border-sunset-orange text-sunset-orange rounded-full hover:bg-sunset-orange/10 transition-colors text-sm whitespace-nowrap"
                >
                  Nur essenzielle
                </button>
                <button
                  onClick={() => handleAccept(true)}
                  className="px-5 py-2 border border-sunset-orange bg-sunset-orange text-navy-deep rounded-full hover:bg-sunset-amber transition-colors text-sm whitespace-nowrap"
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}




