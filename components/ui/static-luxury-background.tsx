"use client";

import { motion } from "framer-motion";
import React from "react";

const StaticLuxuryBackground: React.FC = () => {
  const gradientStops = [
    "#0A0A0A 35%",
    "#2979FF 50%",
    "#FF80AB 60%",
    "#FF6D00 70%",
    "#FFD600 80%",
    "#00E676 90%",
    "#3D5AFE 100%",
  ].join(", ");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 overflow-visible"
    >
      <div
        style={{
          background: `radial-gradient(150% 120% at 50% 0%, ${gradientStops})`,
          filter: "blur(80px)",
        }}
        className="absolute inset-0 h-[80vh] w-full"
      />
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[100px]" />
    </motion.div>
  );
};

export default StaticLuxuryBackground;
