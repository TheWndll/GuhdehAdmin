import React from "react";

export interface WalletCardProps {
  balance: number;
  recentTransactions: { id: string; amount: number; date: string; type: string }[];
  actionLabel: string;
  onAction: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, recentTransactions, actionLabel, onAction }) => (
  <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, maxWidth: 400, margin: "0 auto" }}>
    <h2 style={{ color: "#ea9e01", fontWeight: 700 }}>Wallet Balance</h2>
    <div style={{ fontSize: 32, fontWeight: 700, margin: "16px 0" }}>${balance.toFixed(2)}</div>
    <button onClick={onAction} style={{ background: "#ea9e01", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 16, marginBottom: 24, cursor: "pointer" }}>
      {actionLabel}
    </button>
    <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Recent Transactions</h3>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {recentTransactions.length === 0 ? (
        <li style={{ color: "#888" }}>No transactions yet.</li>
      ) : (
        recentTransactions.map(tx => (
          <li key={tx.id} style={{ marginBottom: 6, fontSize: 15 }}>
            <span style={{ color: tx.type === "credit" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
              {tx.type === "credit" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
            </span>{" "}
            <span style={{ color: "#555" }}>{tx.date}</span>
          </li>
        ))
      )}
    </ul>
  </div>
);

export default WalletCard;
