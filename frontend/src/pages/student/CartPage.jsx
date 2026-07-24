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
      setError(err.message || "Khong tai duoc gio hang");
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
      setError(err.message || "Thao tac that bai");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Cart</span>
        <h2 className="page-title">Gio hang cua ban</h2>
        <p className="page-description">Backend tinh lai gia, giam gia va tong tien truoc khi tao don hang.</p>
      </section>

      {loading && <p className="auth-state">Dang tai gio hang...</p>}
      {error && <p className="auth-error">{error}</p>}

      <section className="page-panel-card course-table">
        {(cart?.items ?? []).map((item) => (
          <div className="course-table-row" key={item.courseId}>
            <div>
              <strong>{item.title}</strong>
              <p>{money.format(item.finalPrice || 0)}</p>
            </div>
            <button className="page-action page-action-secondary" onClick={() => run(() => removeCartItem(item.courseId))}>
              Xoa
            </button>
          </div>
        ))}
        {!loading && (cart?.items?.length ?? 0) === 0 && <p className="page-description">Gio hang dang trong.</p>}
      </section>

      <section className="page-panel-card">
        <div className="course-filter-row">
          <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Ma giam gia" />
          <button className="page-action page-action-primary" onClick={() => run(() => applyCoupon(coupon))}>Ap ma</button>
          {cart?.couponCode && (
            <button className="page-action page-action-secondary" onClick={() => run(removeCoupon)}>Huy ma {cart.couponCode}</button>
          )}
        </div>
        <p>Tam tinh: <strong>{money.format(cart?.subtotalAmount || 0)}</strong></p>
        <p>Giam gia: <strong>{money.format(cart?.discountAmount || 0)}</strong></p>
        <p>Tong thanh toan: <strong>{money.format(cart?.totalAmount || 0)}</strong></p>
        <div className="page-actions">
          <button className="page-action page-action-secondary" onClick={() => run(clearCart)}>Xoa tat ca</button>
          <Link className="page-action page-action-primary" to="/student/checkout">Thanh toan</Link>
        </div>
      </section>
    </div>
  );
}
