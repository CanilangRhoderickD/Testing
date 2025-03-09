
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPieceProps {
  color: string;
  size: number;
  left: string;
  delay: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ color, size, left, delay }) => {
  return (
    <motion.div
      className="absolute top-0 z-50"
      style={{
        left,
        width: size,
        height: size * 0.4,
        backgroundColor: color,
        borderRadius: 2,
      }}
      initial={{ top: -20, rotate: 0, opacity: 1 }}
      animate={{
        top: "120vh",
        rotate: 360,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 5,
        delay,
        ease: "easeInOut",
        repeat: 0,
      }}
    />
  );
};

interface ConfettiProps {
  isVisible: boolean;
  duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ 
  isVisible, 
  duration = 3000 
}) => {
  const [show, setShow] = useState(isVisible);
  
  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);
  
  if (!show) return null;
  
  const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#AB47BC', '#00C853'];
  const sizes = [8, 12, 16, 20];
  
  const confettiPieces = Array.from({ length: 80 }).map((_, i) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const left = `${Math.random() * 100}%`;
    const delay = Math.random() * 2;
    
    return (
      <ConfettiPiece 
        key={i}
        color={color}
        size={size}
        left={left}
        delay={delay}
      />
    );
  });
  
  return <div className="fixed inset-0 pointer-events-none">{confettiPieces}</div>;
};
