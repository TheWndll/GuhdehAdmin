import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {/* App-wide layout wrapper (Stub) */}
    <header style={{ padding: 16, background: '#f5f5f5' }}>
      <h1>Guhdeh App Layout</h1>
    </header>
    <main>{children}</main>
    <footer style={{ padding: 16, background: '#f5f5f5', marginTop: 32 }}>
      <small>© 2025 Guhdeh</small>
    </footer>
  </div>
);

export default Layout;
