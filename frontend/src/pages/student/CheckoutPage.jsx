import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createOrder,
  createPayment,
  getCart,
  getOrder,
  mockCompletePayment,
} from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingOrderCode = searchParams.get("orderCode");

  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);

  useEffect(() => {
    if (existingOrderCode) {
      // Resuming an existing order (from OrderDetailPage "Thanh toán lại")
      getOrder(existingOrderCode)
        .then((o) => {
          setOrder(o);
          return createPayment(o.orderCode);
        })
        .then(setPayment)
        .catch((err) => setError(err.message || "Không tải được đơn hàng"));
    } else {
      getCart()
        .then(setCart)
        .catch((err) => setError(err.message || "Không tải được giỏ hàng"));
    }
  }, [existingOrderCode]);

  async function handleCreateOrder() {
    if (!cart?.items?.length) return;
    try {
      setLoading(true);
      setError("");
      const createdOrder = await createOrder();
      setOrder(createdOrder);
      const createdPayment = await createPayment(createdOrder.orderCode);
      setPayment(createdPayment);
    } catch (err) {
      setError(err.message || "Không tạo được đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  async function handleMock(status) {
    if (!order || !payment) return;
    try {
      setMockLoading(true);
      setError("");
      await mockCompletePayment(order.orderCode, status);
      const statusPath = status === "SUCCESS" ? "success" : status === "FAILED" ? "failed" : "canceled";
      navigate(`/student/payment/${statusPath}?orderCode=${order.orderCode}`);
    } catch (err) {
      setError(err.message || "Mô phỏng thanh toán thất bại");
    } finally {
      setMockLoading(false);
    }
  }

  const showCart = !existingOrderCode && !order;

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Checkout</span>
        <h2 className="page-title">Xác nhận thanh toán</h2>
        <p className="page-description">Hệ thống tính toán thông tin đơn hàng và tổng tiền thanh toán cuối cùng.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}

      <section className="page-panel-card">
        {showCart && (
          <>
            <p>Số khóa học: <strong>{cart?.items?.length ?? 0}</strong></p>
            {(cart?.items ?? []).map((item) => (
              <div key={item.courseId} className="course-table-row" style={{ padding: "0.5rem 0", borderBottom: "1px solid #e2e8f0" }}>
                <span>{item.title}</span>
                <strong>{money.format(item.finalPrice || 0)}</strong>
              </div>
            ))}
            <p style={{ marginTop: "1rem" }}>Tạm tính: <strong>{money.format(cart?.subtotalAmount || 0)}</strong></p>
            {(cart?.discountAmount || 0) > 0 && (
              <p>Giảm giá: <strong style={{ color: "#16a34a" }}>-{money.format(cart.discountAmount)}</strong></p>
            )}
            <p>Tổng thanh toán: <strong style={{ fontSize: "1.2rem", color: "#2563eb" }}>{money.format(cart?.totalAmount || 0)}</strong></p>
            {(cart?.items?.length ?? 0) === 0 ? (
              <p className="page-description">Giỏ hàng đang trống. <Link to="/student/cart">Quay lại giỏ hàng</Link></p>
            ) : (
              <button
                className="page-action page-action-primary"
                disabled={loading || (cart?.items?.length ?? 0) === 0}
                onClick={handleCreateOrder}
                style={{ marginTop: "1rem" }}
              >
                {loading ? "Đang tạo đơn..." : "Tạo đơn hàng"}
              </button>
            )}
          </>
        )}

        {order && (
          <div>
            <p>Mã đơn hàng: <strong>{order.orderCode}</strong></p>
            <p>Tổng thanh toán: <strong style={{ color: "#2563eb" }}>{money.format(order.totalAmount || 0)}</strong></p>
            <p>Trạng thái: <strong style={{ color: "#d97706" }}>Chờ thanh toán</strong></p>
          </div>
        )}
      </section>

      {order && payment && (
        <section className="page-panel-card" style={{ marginTop: "1.5rem", border: "2px dashed #6366f1", borderRadius: "16px" }}>
          <h3 style={{ margin: "0 0 0.5rem", color: "#4f46e5" }}>🧪 THANH TOÁN THỬ NGHIỆM (MOCK)</h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Đây là chế độ mô phỏng cho đồ án. Chọn kết quả thanh toán bên dưới.
          </p>
          <div className="page-actions" style={{ flexWrap: "wrap", gap: "1rem" }}>
            <button
              id="btn-mock-success"
              className="page-action page-action-primary"
              disabled={mockLoading}
              onClick={() => handleMock("SUCCESS")}
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              {mockLoading ? "Đang xử lý..." : "✅ Mô phỏng thành công"}
            </button>
            <button
              id="btn-mock-failed"
              className="page-action page-action-secondary"
              disabled={mockLoading}
              onClick={() => handleMock("FAILED")}
              style={{ borderColor: "#dc2626", color: "#dc2626" }}
            >
              ❌ Mô phỏng thất bại
            </button>
            <button
              id="btn-mock-canceled"
              className="page-action page-action-secondary"
              disabled={mockLoading}
              onClick={() => handleMock("CANCELED")}
            >
              🚫 Hủy thanh toán
            </button>
          </div>
        </section>
      )}

      {!order && !loading && (
        <div className="page-actions" style={{ marginTop: "1rem" }}>
          <Link className="page-action page-action-secondary" to="/student/cart">← Quay lại giỏ hàng</Link>
        </div>
      )}
    </div>
  );
}
