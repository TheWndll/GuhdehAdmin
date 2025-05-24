import React from "react";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {/* Example navbar (stub) */}
    <nav style={{ background: "#ea9e01", padding: 16, color: "#fff", fontWeight: 700 }}>Guhdeh Navbar</nav>
    <main>{children}</main>
  </div>
);

export default AuthLayout;
