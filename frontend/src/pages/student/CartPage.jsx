import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applyCoupon, clearCart, getCart, removeCartItem, removeCoupon } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      setError("");
      setCart(await getCart());
    } catch (err) {
      setError(err.message || "Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function run(action) {
    try {
      setError("");
      setCart(await action());
    } catch (err) {
      setError(err.message || "Thao tác thất bại");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Cart</span>
        <h2 className="page-title">Giỏ hàng của bạn</h2>
        <p className="page-description">Hệ thống tự động tính lại giá, giảm giá và tổng tiền trước khi tạo đơn hàng.</p>
      </section>

      {loading && <p className="auth-state">Đang tải giỏ hàng...</p>}
      {error && <p className="auth-error">{error}</p>}

      <section className="page-panel-card course-table">
        {(cart?.items ?? []).map((item) => (
          <div className="course-table-row" key={item.courseId}>
            <div>
              <strong>{item.title}</strong>
              <p>{money.format(item.finalPrice || 0)}</p>
            </div>
            <button className="page-action page-action-secondary" onClick={() => run(() => removeCartItem(item.courseId))}>
              Xóa
            </button>
          </div>
        ))}
        {!loading && (cart?.items?.length ?? 0) === 0 && <p className="page-description">Giỏ hàng đang trống.</p>}
      </section>

      <section className="page-panel-card">
        <div className="course-filter-row">
          <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Mã giảm giá" style={{ textTransform: 'uppercase' }} />
          <button className="page-action page-action-primary" onClick={() => run(() => applyCoupon(coupon.trim().toUpperCase()))}>Áp mã</button>
          {cart?.couponCode && (
            <button className="page-action page-action-secondary" onClick={() => run(removeCoupon)}>Hủy mã {cart.couponCode}</button>
          )}
        </div>
        <p>Tạm tính: <strong>{money.format(cart?.subtotalAmount || 0)}</strong></p>
        <p>Giảm giá: <strong>{money.format(cart?.discountAmount || 0)}</strong></p>
        <p>Tổng thanh toán: <strong>{money.format(cart?.totalAmount || 0)}</strong></p>
        <div className="page-actions">
          <button className="page-action page-action-secondary" onClick={() => run(clearCart)}>Xóa tất cả</button>
          <Link
            className={`page-action page-action-primary${(cart?.items?.length ?? 0) === 0 ? " page-action-disabled" : ""}`}
            to="/student/checkout"
            style={(cart?.items?.length ?? 0) === 0 ? { pointerEvents: "none", opacity: 0.5 } : {}}
            aria-disabled={(cart?.items?.length ?? 0) === 0}
          >
            Thanh toán
          </Link>
        </div>
      </section>
    </div>
  );
}
