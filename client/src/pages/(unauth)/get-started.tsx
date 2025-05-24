import React from "react";
import { useLocation } from "wouter";

const GetStarted: React.FC = () => {
  const [, setLocation] = useLocation();
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Get Started</h1>
      <button
        style={{ background: "#ea9e01", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 18, marginBottom: 16, cursor: "pointer" }}
        onClick={() => setLocation("/signup?role=requester")}
      >
        I’m a Requester
      </button>
      <button
        style={{ background: "#ea9e01", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 18, cursor: "pointer" }}
        onClick={() => setLocation("/signup?role=runner")}
      >
        I’m a Runner
      </button>
    </div>
  );
};

export default GetStarted;
