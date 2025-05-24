import React, { useState } from "react";
import { useLocation } from "wouter";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Get role from query string (?role=requester or ?role=runner)
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || "requester";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulate signup logic (replace with real API call)
    setTimeout(() => {
      // Store user in localStorage for demo
      localStorage.setItem("guhdeh_auth", JSON.stringify({ email, role }));
      // Redirect based on role
      if (role === "runner") {
        setLocation("/runner/wallet");
      } else {
        setLocation("/requester/wallet");
      }
    }, 1000);
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Sign Up</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
          required
        />
        {error && <div style={{ color: "red", fontSize: 14 }}>{error}</div>}
        <button
          type="submit"
          style={{ background: "#ea9e01", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 18, cursor: loading ? "not-allowed" : "pointer" }}
          disabled={loading}
        >
          {loading ? "Signing up..." : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </button>
      </form>
    </div>
  );
};

export default Signup;
