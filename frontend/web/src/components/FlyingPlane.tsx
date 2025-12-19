import { motion } from 'framer-motion';

export default function FlyingPlane() {
  return (
    <div className="relative w-full h-[50px] bg-navy-deep overflow-hidden">
      {/* Decorative white dotted line */}
      <div className="absolute top-1/2 left-0 right-0 h-px border-t-2 border-dashed border-white/40" />
      
      {/* Animated Plane */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        initial={{ x: '-100px' }}
        animate={{ x: '100vw' }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Side-view Airplane SVG */}
        <svg
          width="80"
          height="40"
          viewBox="0 0 120 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Contrails */}
          <path d="M0 28 L-25 28" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
          <path d="M0 32 L-20 33" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
          
          {/* Tail vertical stabilizer (Seitenleitwerk) */}
          <path d="M8 30 L2 12 L8 12 L14 25 Z" fill="#FF8C42" />
          
          {/* Tail horizontal stabilizer (Höhenleitwerk) */}
          <path d="M2 30 L-4 26 L-4 24 L8 28 L8 32 L-4 36 L-4 34 Z" fill="#F5A623" />
          
          {/* Fuselage (Rumpf) */}
          <path d="M8 22 L100 20 Q115 25 100 30 L8 32 Q2 27 8 22 Z" fill="#F8FAFC" />
          
          {/* Wing (Flügel) - side view, only one wing visible */}
          <path d="M45 27 L35 8 L42 8 L52 24 L68 24 L52 27 Z" fill="#F5A623" />
          
          {/* Cockpit windows */}
          <path d="M95 22 Q105 22 105 26 Q105 28 95 28 Z" fill="#7EB8DA" />
          
          {/* Passenger windows */}
          <circle cx="85" cy="25" r="2" fill="#7EB8DA" />
          <circle cx="77" cy="25" r="2" fill="#7EB8DA" />
          <circle cx="69" cy="25" r="2" fill="#7EB8DA" />
          <circle cx="61" cy="25" r="2" fill="#7EB8DA" />
          <circle cx="53" cy="25" r="2" fill="#7EB8DA" />
          <circle cx="45" cy="25" r="2" fill="#7EB8DA" />
          <circle cx="37" cy="26" r="2" fill="#7EB8DA" />
          <circle cx="29" cy="26" r="2" fill="#7EB8DA" />
          
          {/* Engine under wing */}
          <ellipse cx="55" cy="34" rx="8" ry="4" fill="#94A3B8" />
          <ellipse cx="55" cy="34" rx="5" ry="2.5" fill="#64748B" />
        </svg>
      </motion.div>
    </div>
  );
}
