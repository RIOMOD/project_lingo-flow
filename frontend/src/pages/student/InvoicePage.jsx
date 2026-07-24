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
      .catch((err) => setError(err.message || "Khong tai duoc hoa don"));
  }, [orderCode]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Invoice</span>
        <h2 className="page-title">Hoa don {orderCode}</h2>
        <p className="page-description">Hoa don chi duoc tao sau khi thanh toan thanh cong.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="page-panel-card">
        {invoice ? (
          <>
            <p>Ma hoa don: <strong>{invoice.invoiceCode}</strong></p>
            <p>Nguoi mua: <strong>{invoice.billingName}</strong></p>
            <p>Email: <strong>{invoice.billingEmail}</strong></p>
            <p>Tong tien: <strong>{money.format(invoice.totalAmount || 0)}</strong></p>
          </>
        ) : (
          <p className="page-description">Don hang chua co hoa don.</p>
        )}
      </section>
    </div>
  );
}
