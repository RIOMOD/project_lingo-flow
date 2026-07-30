import { Link } from "react-router-dom";

const steps = [
  { number: 1, label: "Thông tin cơ bản", key: "basic" },
  { number: 2, label: "Xây dựng nội dung", key: "content" },
  { number: 3, label: "Xem trước và kiểm tra", key: "preview" },
  { number: 4, label: "Gửi Admin duyệt", key: "submit" },
];

function resolveStepLink(stepKey, courseId) {
  if (!courseId) return null;
  switch (stepKey) {
    case "basic":
      return `/teacher/courses/${courseId}/edit`;
    case "content":
      return `/teacher/courses/${courseId}/content`;
    case "preview":
    case "submit":
      return `/teacher/courses/${courseId}/preview`;
    default:
      return null;
  }
}

export default function CourseWorkflowStepper({ activeStep, courseId, submitted = false }) {
  return (
    <div
      className="page-panel-card"
      style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem", padding: "1rem 1.25rem" }}
    >
      <strong style={{ fontSize: "1rem" }}>Luồng tạo khóa học</strong>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {steps.map((step) => {
          const completed = submitted ? true : step.number < activeStep;
          const current = submitted ? step.number === 4 : step.number === activeStep;
          const link = resolveStepLink(step.key, courseId);
          const content = (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 0.85rem",
                borderRadius: "999px",
                background: current ? "#10233f" : completed ? "#e8f5e9" : "#f3f5f7",
                color: current ? "#ffffff" : completed ? "#1b5e20" : "#334155",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "1.6rem",
                  height: "1.6rem",
                  borderRadius: "999px",
                  background: current ? "#ffffff" : completed ? "#2e7d32" : "#d7dde3",
                  color: current ? "#10233f" : "#ffffff",
                  fontSize: "0.85rem",
                }}
              >
                {completed && !current ? "✓" : step.number}
              </span>
              <span>{step.label}</span>
            </span>
          );

          if (!link || current) {
            return <span key={step.key}>{content}</span>;
          }

          return (
            <Link key={step.key} to={link} style={{ textDecoration: "none" }}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
