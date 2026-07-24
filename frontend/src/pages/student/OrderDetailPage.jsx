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
      setError(err.message || "Không tải được đơn hàng");
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
      setError(err.message || "Không tạo được thanh toán");
    }
  }

  async function handleCancel() {
    try {
      setOrder(await cancelOrder(orderCode));
    } catch (err) {
      setError(err.message || "Không hủy được đơn hàng");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Order detail</span>
        <h2 className="page-title">{orderCode}</h2>
        <p className="page-description">Thông tin chi tiết khóa học và hóa đơn được lưu trữ bảo mật theo đơn hàng.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      {order && (
        <section className="page-panel-card">
          <p>Trạng thái: <strong>{order.status}</strong></p>
          <p>Tổng tiền: <strong>{money.format(order.totalAmount || 0)}</strong></p>
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
            {order.status === "PENDING_PAYMENT" && <button className="page-action page-action-primary" onClick={handlePay}>Thanh toán</button>}
            {order.status === "PENDING_PAYMENT" && <button className="page-action page-action-secondary" onClick={handleCancel}>Hủy đơn</button>}
            {paymentUrl && <a className="page-action page-action-primary" href={paymentUrl}>Mở cổng thanh toán</a>}
            {order.invoice && <Link className="page-action page-action-secondary" to={`/student/orders/${order.orderCode}/invoice`}>Hóa đơn</Link>}
          </div>
        </section>
      )}
    </div>
  );
}
