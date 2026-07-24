export const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function formatMoney(value) {
  return moneyFormatter.format(value || 0);
}

export function levelLabel(level) {
  switch (level) {
    case "BEGINNER":
      return "Sơ cấp";
    case "ELEMENTARY":
      return "Căn bản";
    case "INTERMEDIATE":
      return "Trung cấp";
    case "ADVANCED":
      return "Nâng cao";
    default:
      return level || "Chưa xác định";
  }
}

export function courseTypeLabel(courseType) {
  return courseType === "FREE" ? "Miễn phí" : "Trả phí";
}

export function courseStatusLabel(status) {
  switch (status) {
    case "DRAFT":
      return "Bản nháp";
    case "REJECTED":
      return "Bị từ chối";
    case "SUBMITTED":
      return "Chờ duyệt";
    case "APPROVED":
      return "Đã duyệt";
    case "PUBLISHED":
      return "Đã xuất bản";
    case "HIDDEN":
      return "Đang ẩn";
    case "ARCHIVED":
      return "Đã lưu trữ";
    default:
      return status || "Chưa xác định";
  }
}

export function saleStatusLabel(status) {
  switch (status) {
    case "ACTIVE":
      return "Đang sale";
    case "SCHEDULED":
      return "Sắp diễn ra";
    case "EXPIRED":
      return "Đã kết thúc";
    default:
      return "Chưa có sale";
  }
}

export function lessonTypeLabel(type) {
  switch (type) {
    case "TEXT":
      return "Văn bản";
    case "VIDEO":
      return "Video";
    case "AUDIO":
      return "Âm thanh";
    case "MIXED":
      return "Kết hợp";
    default:
      return type || "Khác";
  }
}

export function lessonStatusLabel(status) {
  switch (status) {
    case "DRAFT":
      return "Bản nháp";
    case "PUBLISHED":
      return "Hoàn thiện";
    case "HIDDEN":
      return "Đang ẩn";
    default:
      return status || "Chưa xác định";
  }
}

export function canTeacherEditCourse(course) {
  return course?.status === "DRAFT" || course?.status === "REJECTED";
}

export function progressTone(percent) {
  if (percent >= 100) return "#2e7d32";
  if (percent >= 60) return "#ef6c00";
  return "#2a6ed4";
}
