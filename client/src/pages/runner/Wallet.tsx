import React, { useMemo } from "react";
import { mockTransactions } from "../../services/mockTransactions";
import WalletCard from "../../components/WalletCard";

const RunnerWallet: React.FC = () => {
  // Calculate balance from mock transactions
  const balance = useMemo(() => mockTransactions.reduce((acc, tx) => acc + tx.amount, 0), []);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <WalletCard
        balance={balance}
        recentTransactions={mockTransactions}
        actionLabel="Withdraw"
        onAction={() => {}}
      />
    </div>
  );
};

export default RunnerWallet;
