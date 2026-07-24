import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function InvoicePage() {
  const { orderCode } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrder(orderCode)
      .then((order) => setInvoice(order?.invoice ?? null))
      .catch((err) => setError(err.message || "Không tải được hóa đơn"));
  }, [orderCode]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Invoice</span>
        <h2 className="page-title">Hóa đơn {orderCode}</h2>
        <p className="page-description">Hóa đơn điện tử chỉ được tạo tự động sau khi thanh toán thành công.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="page-panel-card">
        {invoice ? (
          <>
            <p>Mã hóa đơn: <strong>{invoice.invoiceCode}</strong></p>
            <p>Người mua: <strong>{invoice.billingName}</strong></p>
            <p>Email: <strong>{invoice.billingEmail}</strong></p>
            <p>Tổng tiền: <strong>{money.format(invoice.totalAmount || 0)}</strong></p>
          </>
        ) : (
          <p className="page-description">Đơn hàng này chưa có hóa đơn.</p>
        )}
      </section>
    </div>
  );
}
