import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function Orb({ color, size, x, y, delay }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}40 0%, ${color}10 40%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      initial={{ x, y, scale: 0.8, opacity: 0 }}
      animate={{
        x: [x, x + 50, x - 30, x],
        y: [y, y - 40, y + 30, y],
        scale: [0.8, 1.1, 0.9, 0.8],
        opacity: [0.4, 0.7, 0.5, 0.4],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export default function GradientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <Orb color="#6366f1" size={400} x={-100} y={-100} delay={0} />
      <Orb color="#8b5cf6" size={350} x={800} y={100} delay={2} />
      <Orb color="#a855f7" size={300} x={400} y={500} delay={4} />
      <Orb color="#3b82f6" size={280} x={100} y={400} delay={1} />
      <Orb color="#6366f1" size={200} x={900} y={600} delay={3} />
    </div>
  );
}
