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
    getCart().then(setCart).catch((err) => setError(err.message || "Khong tai duoc gio hang"));
  }, []);

  async function handleCreateOrder() {
    try {
      setLoading(true);
      setError("");
      const createdOrder = await createOrder();
      setOrder(createdOrder);
      setPayment(await createPayment(createdOrder.orderCode));
    } catch (err) {
      setError(err.message || "Khong tao duoc don hang");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Checkout</span>
        <h2 className="page-title">Xac nhan thanh toan</h2>
        <p className="page-description">Frontend chi hien thi thong tin, backend se tao don va tinh tong tien cuoi cung.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="page-panel-card">
        <p>So khoa hoc: <strong>{cart?.items?.length ?? 0}</strong></p>
        <p>Tam tinh: <strong>{money.format(cart?.subtotalAmount || 0)}</strong></p>
        <p>Giam gia: <strong>{money.format(cart?.discountAmount || 0)}</strong></p>
        <p>Tong thanh toan: <strong>{money.format(cart?.totalAmount || 0)}</strong></p>
        {!order && (
          <button className="page-action page-action-primary" disabled={loading} onClick={handleCreateOrder}>
            {loading ? "Dang tao don..." : "Tao don hang"}
          </button>
        )}
        {order && (
          <div>
            <p>Ma don: <strong>{order.orderCode}</strong></p>
            <p>Trang thai: <strong>{order.status}</strong></p>
            <div className="page-actions">
              {payment?.paymentUrl && <a className="page-action page-action-primary" href={payment.paymentUrl}>Mo cong thanh toan</a>}
              <Link className="page-action page-action-secondary" to={`/student/orders/${order.orderCode}`}>Xem don hang</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
