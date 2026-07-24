import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createOrder, createPayment, getCart } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCart().then(setCart).catch((err) => setError(err.message || "Không tải được giỏ hàng"));
  }, []);

  async function handleCreateOrder() {
    try {
      setLoading(true);
      setError("");
      const createdOrder = await createOrder();
      setOrder(createdOrder);
      setPayment(await createPayment(createdOrder.orderCode));
    } catch (err) {
      setError(err.message || "Không tạo được đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Checkout</span>
        <h2 className="page-title">Xác nhận thanh toán</h2>
        <p className="page-description">Hệ thống tính toán thông tin đơn hàng và tổng tiền thanh toán cuối cùng.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="page-panel-card">
        <p>Số khóa học: <strong>{cart?.items?.length ?? 0}</strong></p>
        <p>Tạm tính: <strong>{money.format(cart?.subtotalAmount || 0)}</strong></p>
        <p>Giảm giá: <strong>{money.format(cart?.discountAmount || 0)}</strong></p>
        <p>Tổng thanh toán: <strong>{money.format(cart?.totalAmount || 0)}</strong></p>
        {!order && (
          <button className="page-action page-action-primary" disabled={loading} onClick={handleCreateOrder}>
            {loading ? "Đang tạo đơn..." : "Tạo đơn hàng"}
          </button>
        )}
        {order && (
          <div>
            <p>Mã đơn: <strong>{order.orderCode}</strong></p>
            <p>Trạng thái: <strong>{order.status}</strong></p>
            <div className="page-actions">
              {payment?.paymentUrl && <a className="page-action page-action-primary" href={payment.paymentUrl}>Mở cổng thanh toán</a>}
              <Link className="page-action page-action-secondary" to={`/student/orders/${order.orderCode}`}>Xem đơn hàng</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
