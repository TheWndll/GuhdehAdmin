import React from "react";

const UnauthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "#f9fafb" }}>{children}</div>
);

export default UnauthLayout;
