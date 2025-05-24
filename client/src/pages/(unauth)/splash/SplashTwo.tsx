import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const SplashTwo: React.FC = () => {
  const [, setLocation] = useLocation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <h2 style={{ fontWeight: 700, fontSize: 28, color: "#ea9e01", marginBottom: 24 }}>
        “Anything you want, We’ll Go There”
      </h2>
      <button
        style={{ background: "#ea9e01", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 18, cursor: "pointer" }}
        onClick={() => setLocation("/get-started")}
      >
        Get Started
      </button>
    </motion.div>
  );
};

export default SplashTwo;
