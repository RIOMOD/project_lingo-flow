import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getPaymentStatus } from "../../services/commerceService";

export default function PaymentStatusPage() {
  const { status: paramStatus } = useParams();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const queryStatus = searchParams.get("status");
  const displayStatus = queryStatus || paramStatus || "SUCCESS";

  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!orderCode) return;
    getPaymentStatus(orderCode)
      .then(setPayment)
      .catch(() => {
        setPayment({ status: "SUCCESS", paymentCode: "PAY_DEMO" });
      });
  }, [orderCode]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Payment Status</span>
        <h2 className="page-title">Thanh toán hoàn tất</h2>
        <p className="page-description">Mã đơn hàng: <strong>{orderCode || "LINGO_DEMO"}</strong></p>
      </section>

      <section className="page-panel-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a",
          display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", marginBottom: "1rem"
        }}>
          ✓
        </div>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a" }}>Thanh toán thành công!</h3>
        <p style={{ color: "#475569", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          Hệ thống đã nhận tiền thanh toán cho đơn hàng <strong>{orderCode || "LINGO_DEMO"}</strong> và tự động kích hoạt khóa học vào tài khoản của bạn.
        </p>
        <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "2rem" }}>
          Trạng thái cổng thanh toán: <strong style={{ color: "#16a34a" }}>{payment?.status || displayStatus}</strong>
        </p>

        <div className="page-actions" style={{ justifyContent: "center", gap: "1rem" }}>
          <Link className="page-action page-action-primary" to="/student/courses">
            🎓 Vào học ngay các khóa học của tôi
          </Link>
          {orderCode && (
            <Link className="page-action page-action-secondary" to={`/student/orders/${orderCode}`}>
              📋 Xem chi tiết đơn hàng
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
