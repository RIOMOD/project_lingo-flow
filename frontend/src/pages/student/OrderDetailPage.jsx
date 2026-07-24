import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelOrder, createPayment, getOrder } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function OrderDetailPage() {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");

  async function loadOrder() {
    try {
      setOrder(await getOrder(orderCode));
    } catch (err) {
      setError(err.message || "Khong tai duoc don hang");
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderCode]);

  async function handlePay() {
    try {
      const payment = await createPayment(orderCode);
      setPaymentUrl(payment.paymentUrl);
    } catch (err) {
      setError(err.message || "Khong tao duoc thanh toan");
    }
  }

  async function handleCancel() {
    try {
      setOrder(await cancelOrder(orderCode));
    } catch (err) {
      setError(err.message || "Khong huy duoc don hang");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Order detail</span>
        <h2 className="page-title">{orderCode}</h2>
        <p className="page-description">Snapshot khoa hoc va hoa don duoc luu rieng theo don hang.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      {order && (
        <section className="page-panel-card">
          <p>Trang thai: <strong>{order.status}</strong></p>
          <p>Tong tien: <strong>{money.format(order.totalAmount || 0)}</strong></p>
          <div className="course-table">
            {(order.items ?? []).map((item) => (
              <div className="course-table-row" key={item.courseId}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{money.format(item.finalPrice || 0)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="page-actions">
            {order.status === "PENDING_PAYMENT" && <button className="page-action page-action-primary" onClick={handlePay}>Thanh toan</button>}
            {order.status === "PENDING_PAYMENT" && <button className="page-action page-action-secondary" onClick={handleCancel}>Huy don</button>}
            {paymentUrl && <a className="page-action page-action-primary" href={paymentUrl}>Mo cong thanh toan</a>}
            {order.invoice && <Link className="page-action page-action-secondary" to={`/student/orders/${order.orderCode}/invoice`}>Hoa don</Link>}
          </div>
        </section>
      )}
    </div>
  );
}
