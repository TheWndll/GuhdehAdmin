import React from "react";

const Login: React.FC = () => (
  <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Login</h1>
    <form style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <input type="email" placeholder="Email" style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }} />
      <input type="password" placeholder="Password" style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }} />
      <button style={{ background: "#ea9e01", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 18, cursor: "pointer" }}>
        Login
      </button>
    </form>
  </div>
);

export default Login;
