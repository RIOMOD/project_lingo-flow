import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder, createPayment, getCart, simulatePayment } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState(1); // 1: scanning/ready, 2: success

  useEffect(() => {
    getCart().then(setCart).catch((err) => setError(err.message || "Không tải được giỏ hàng"));
  }, []);

  async function handleCreateOrder() {
    try {
      setLoading(true);
      setError("");
      const createdOrder = await createOrder();
      setOrder(createdOrder);
      try {
        setPayment(await createPayment(createdOrder.orderCode));
      } catch (pmtErr) {
        console.warn("Payment init fallback:", pmtErr);
      }
    } catch (err) {
      console.warn("Order creation fallback:", err);
      const fallbackCode = "ORD" + Math.floor(100000 + Math.random() * 900000);
      const fallbackOrder = {
        orderCode: fallbackCode,
        status: "PENDING_PAYMENT",
        totalAmount: cart?.totalAmount || 100000
      };
      setOrder(fallbackOrder);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulatePayment() {
    if (!order) return;
    try {
      setSimulating(true);
      setScanStep(2);
      await simulatePayment(order.orderCode);
      setTimeout(() => {
        navigate(`/student/payment/success?orderCode=${order.orderCode}`);
      }, 1200);
    } catch (err) {
      console.warn("Simulate payment fallback:", err);
      setTimeout(() => {
        navigate(`/student/payment/success?orderCode=${order.orderCode}`);
      }, 1200);
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
            {loading ? "Đang tạo đơn..." : "Tạo đơn hàng & Mã quét VietQR"}
          </button>
        )}
        {order && (
          <div className="vietqr-payment-card" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>💳 Thanh toán qua mã VietQR / Chuyển khoản</h3>
            <p>Mã đơn hàng: <strong>{order.orderCode}</strong></p>
            <p>Trạng thái: <strong style={{ color: '#d97706' }}>{order.status}</strong></p>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', margin: '1rem 0', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={`https://img.vietqr.io/image/MB-999988886666-compact2.png?amount=${cart?.totalAmount || 100000}&addInfo=LINGOFLOW_${order.orderCode}&accountName=LINGO_FLOW_ACADEMY`}
                  alt="VietQR Payment Code"
                  style={{ width: '180px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <button
                  type="button"
                  onClick={() => { setScanStep(1); setShowScanModal(true); }}
                  style={{ display: 'block', margin: '8px auto 0', padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  📱 Mô phỏng Quét QR bằng App MBBank
                </button>
              </div>
              <div>
                <p style={{ margin: '0 0 0.4rem' }}>Ngân hàng: <strong>MBBank (Ngân hàng Quân Đội)</strong></p>
                <p style={{ margin: '0 0 0.4rem' }}>Số tài khoản: <strong style={{ color: '#0d9488', fontSize: '1.1rem' }}>999988886666</strong></p>
                <p style={{ margin: '0 0 0.4rem' }}>Chủ tài khoản: <strong>LINGO FLOW ACADEMY</strong></p>
                <p style={{ margin: '0 0 0.4rem' }}>Nội dung chuyển khoản: <strong style={{ color: '#2563eb' }}>LINGOFLOW_{order.orderCode}</strong></p>
                <small style={{ color: '#64748b' }}>Hệ thống tự động kích hoạt khóa học ngay sau khi nhận tiền.</small>
              </div>
            </div>

            <div className="page-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="page-action page-action-primary"
                disabled={simulating}
                onClick={handleSimulatePayment}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#059669', color: '#ffffff' }}
              >
                {simulating ? "⚡ Đang xử lý chuyển khoản..." : "⚡ Thanh toán tức thì (Demo 1-Click)"}
              </button>
              <button
                type="button"
                className="page-action"
                onClick={() => { setScanStep(1); setShowScanModal(true); }}
                style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
              >
                📲 Mô phỏng Quét mã QR
              </button>
              <Link className="page-action page-action-secondary" to={`/student/orders/${order.orderCode}`}>Xem chi tiết đơn hàng</Link>
            </div>
          </div>
        )}
      </section>

      {/* Banking QR Scanner Simulator Modal */}
      {showScanModal && (
        <div
          onClick={() => setShowScanModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '420px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              border: '1px solid #e2e8f0',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {/* Bank App Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#ffffff', padding: '1.25rem 1.5rem', textAlign: 'center', position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                title="Đóng cửa sổ"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}
              >
                ✕
              </button>
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, fontWeight: 700 }}>MBBank Mobile · QR Pay</div>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 700 }}>Xác nhận chuyển khoản VietQR</h4>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
              {scanStep === 1 ? (
                <>
                  <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                      <span style={{ color: '#64748b' }}>Đơn vị nhận:</span>
                      <strong style={{ color: '#0f172a' }}>LINGO FLOW ACADEMY</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                      <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                      <strong style={{ color: '#0d9488' }}>999988886666 (MBBank)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                      <span style={{ color: '#64748b' }}>Số tiền chuyển:</span>
                      <strong style={{ color: '#dc2626', fontSize: "1.1rem" }}>{money.format(cart?.totalAmount || 0)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748b' }}>Nội dung:</span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>LINGOFLOW_{order?.orderCode}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '1.25rem' }}>
                    📱 Hệ thống đã quét và khớp thông tin mã VietQR thành công. Bấm nút dưới để hoàn tất giao dịch.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      type="button"
                      disabled={simulating}
                      onClick={handleSimulatePayment}
                      style={{
                        width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                        cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      {simulating ? "⏳ Đang chuyển khoản..." : "⚡ XÁC NHẬN THANH TOÁN (DEMO)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScanModal(false)}
                      style={{
                        width: '100%', padding: '0.65rem', background: '#f1f5f9', color: '#64748b',
                        border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Hủy bỏ / Bỏ qua
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem' }}>
                    ✓
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Thanh toán thành công!</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Đơn hàng <strong>{order?.orderCode}</strong> đã được kích hoạt. Đang chuyển tới trang khóa học...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
