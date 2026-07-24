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
          <div className="vietqr-payment-card" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>💳 Thanh toán qua mã VietQR / Chuyển khoản</h3>
            <p>Mã đơn hàng: <strong>{order.orderCode}</strong></p>
            <p>Trạng thái: <strong style={{ color: '#d97706' }}>{order.status}</strong></p>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', margin: '1rem 0', flexWrap: 'wrap' }}>
              <img
                src={`https://img.vietqr.io/image/MB-123456789-compact2.png?amount=${cart?.totalAmount || 100000}&addInfo=LINGOFLOW_${order.orderCode}&accountName=LINGO_FLOW_ACADEMY`}
                alt="VietQR Payment Code"
                style={{ width: '180px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', padding: '8px' }}
              />
              <div>
                <p style={{ margin: '0 0 0.4rem' }}>Ngân hàng: <strong>MBBank (Ngân hàng Quân Đội)</strong></p>
                <p style={{ margin: '0 0 0.4rem' }}>Số tài khoản: <strong style={{ color: '#0d9488', fontSize: '1.1rem' }}>999988886666</strong></p>
                <p style={{ margin: '0 0 0.4rem' }}>Chủ tài khoản: <strong>LINGO FLOW ACADEMY</strong></p>
                <p style={{ margin: '0 0 0.4rem' }}>Nội dung chuyển khoản: <strong style={{ color: '#2563eb' }}>LINGOFLOW_{order.orderCode}</strong></p>
                <small style={{ color: '#64748b' }}>Hệ thống tự động kích hoạt khóa học ngay sau khi nhận tiền.</small>
              </div>
            </div>

            <div className="page-actions" style={{ marginTop: '1rem' }}>
              {payment?.paymentUrl && <a className="page-action page-action-primary" href={payment.paymentUrl}>Mở cổng thanh toán tự động</a>}
              <Link className="page-action page-action-secondary" to={`/student/orders/${order.orderCode}`}>Xem chi tiết đơn hàng</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
