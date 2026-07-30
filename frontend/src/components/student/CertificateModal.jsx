import { exportDocumentToPDF } from "../../utils/pdfExporter";

export default function CertificateModal({ studentName = "Trần Hà Linh", courseTitle = "Khóa Học Tiếng Anh Giao Tiếp Thông Minh", completionDate = "27/07/2026", onClose }) {
  const handleDownload = () => {
    exportDocumentToPDF({
      title: `Chung_Nhan_${studentName.replaceAll(" ", "_")}`,
      elementId: "certificate-render-area"
    });
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
      <div style={{ background: "#ffffff", borderRadius: "24px", maxWidth: "800px", width: "100%", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative" }}>
        
        {/* Close Button */}
        <button 
          type="button" 
          onClick={onClose}
          style={{ position: "absolute", top: "1rem", right: "1.25rem", background: "none", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer" }}
        >
          ×
        </button>

        {/* Certificate Render Area */}
        <div 
          id="certificate-render-area"
          style={{
            border: "12px solid #0d9488",
            borderRadius: "16px",
            padding: "3rem 2rem",
            background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)",
            textAlign: "center",
            position: "relative",
            boxSizing: "border-box"
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎓</div>
          <span style={{ textTransform: "uppercase", tracking: "2px", fontSize: "0.85rem", fontWeight: "800", color: "#0d9488", letterSpacing: "2px" }}>
            HỌC VIỆN ANH NGỮ THÔNG MINH LINGOFOW
          </span>

          <h2 style={{ fontSize: "2.2rem", fontWeight: "900", color: "#0f172a", margin: "0.5rem 0 1rem 0", fontFamily: "Georgia, serif" }}>
            CHỨNG NHẬN HOÀN THÀNH KHOÁ HỌC
          </h2>

          <p style={{ color: "#64748b", fontSize: "1rem", margin: "0 0 1.5rem 0" }}>
            Chứng nhận này được trang trọng trao cho:
          </p>

          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "#0d9488", borderBottom: "2px solid #0d9488", display: "inline-block", paddingBottom: "0.3rem", margin: "0 0 1.5rem 0" }}>
            {studentName}
          </h3>

          <p style={{ color: "#334155", fontSize: "1.05rem", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto 2rem auto" }}>
            Đã hoàn thành xuất sắc toàn bộ nội dung bài học, bài tập thực hành và kỳ kiểm tra năng lực thuộc khóa học:
            <br />
            <strong style={{ color: "#0f172a", fontSize: "1.2rem", display: "block", marginTop: "0.5rem" }}>"{courseTitle}"</strong>
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "2rem", padding: "0 2rem" }}>
            <div style={{ textAlign: "left" }}>
              <span style={{ display: "block", fontSize: "0.85rem", color: "#64748b" }}>Ngày cấp chứng nhận:</span>
              <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{completionDate}</strong>
            </div>

            {/* Gold Seal Badge */}
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.4)", border: "3px solid #ffffff" }}>
              <span style={{ fontSize: "1.5rem" }}>🏆</span>
              <span style={{ fontSize: "0.6rem", fontWeight: "900", letterSpacing: "1px" }}>VERIFIED</span>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: "0.85rem", color: "#64748b" }}>Mã chứng nhận:</span>
              <strong style={{ fontSize: "1rem", color: "#0d9488" }}>LF-CERT-8823</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", fontWeight: "700", cursor: "pointer" }}
          >
            Đóng
          </button>
          <button 
            type="button" 
            onClick={handleDownload}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", border: "none", background: "#0d9488", color: "#ffffff", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span>📥 Tải chứng nhận (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
