import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const SplashOne: React.FC = () => {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => setLocation("/splash-two"), 5000);
    return () => clearTimeout(timer);
  }, [setLocation]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <img src="/assets/guhdeh-logo.png" alt="Guhdeh Logo" style={{ width: 120, marginBottom: 32 }} />
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 16 }}>Welcome to Guhdeh</h1>
      <p style={{ fontSize: 18, color: "#444", marginBottom: 40 }}>Errands & Delivery, Simplified.</p>
    </motion.div>
  );
};

export default SplashOne;
