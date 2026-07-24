import { useEffect, useState } from "react";
import { getAdminTransactions } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function TransactionManagementPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminTransactions({ size: 20 })
      .then((data) => setTransactions(data?.items ?? []))
      .catch((err) => setError(err.message || "Khong tai duoc giao dich"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Quan ly giao dich</h2>
        <p className="page-description">Theo doi transaction_code, payment_code va ket qua gateway.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {transactions.map((transaction) => (
          <div className="course-table-row" key={transaction.transactionCode}>
            <div>
              <strong>{transaction.transactionCode}</strong>
              <p>{transaction.paymentCode} - {transaction.status}</p>
            </div>
            <span>{money.format(transaction.amount || 0)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
