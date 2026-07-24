import { useEffect, useState } from "react";
import { getAdminCoupons } from "../../services/commerceService";

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminCoupons({ size: 20 })
      .then((data) => setCoupons(data?.items ?? []))
      .catch((err) => setError(err.message || "Khong tai duoc coupon"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Quan ly ma giam gia</h2>
        <p className="page-description">Danh sach coupon dang co trong he thong.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {coupons.map((coupon) => (
          <div className="course-table-row" key={coupon.id}>
            <div>
              <strong>{coupon.code}</strong>
              <p>{coupon.name} - {coupon.discountType} {coupon.discountValue}</p>
            </div>
            <span>{coupon.status} - da dung {coupon.usedCount}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
