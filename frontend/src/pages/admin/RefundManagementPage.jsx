import { useEffect, useState } from "react";
import { getAdminRefunds } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function RefundManagementPage() {
  const [refunds, setRefunds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminRefunds({ size: 20 })
      .then((data) => setRefunds(data?.items ?? []))
      .catch((err) => setError(err.message || "Khong tai duoc refund"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Quan ly hoan tien</h2>
        <p className="page-description">Theo doi refund request va trang thai xu ly.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {refunds.map((refund) => (
          <div className="course-table-row" key={refund.id}>
            <div>
              <strong>{refund.orderCode}</strong>
              <p>{refund.userEmail} - {refund.reason}</p>
            </div>
            <span>{refund.status} - {money.format(refund.amount || 0)}</span>
          </div>
        ))}
        {refunds.length === 0 && <p className="page-description">Chua co yeu cau hoan tien.</p>}
      </section>
    </div>
  );
}
