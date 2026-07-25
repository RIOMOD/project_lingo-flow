import { useEffect, useState } from "react";
import {
  clearCourseSale,
  getAdminCourses,
  hideCourse,
  publishCourse,
  updateCourseSale,
} from "../../services/courseService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

function toDateTimeInput(value) {
  if (!value) return "";
  return value.slice(0, 16);
}

function createDraft(course) {
  return {
    salePrice: course.salePrice ?? "",
    saleStartAt: toDateTimeInput(course.saleStartAt),
    saleEndAt: toDateTimeInput(course.saleEndAt),
  };
}

function saleStatusLabel(status) {
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

function validateSaleDraft(course, draft) {
  if (course.courseType !== "PAID") {
    return "Chỉ có thể tạo khuyến mãi cho khóa học trả phí.";
  }

  const originalPrice = Number(course.originalPrice || 0);
  const salePrice = Number(draft.salePrice);
  if (Number.isNaN(salePrice) || salePrice < 0) {
    return "Giá sale phải lớn hơn hoặc bằng 0.";
  }
  if (salePrice >= originalPrice) {
    return "Giá sale phải nhỏ hơn giá gốc.";
  }
  if (!draft.saleStartAt || !draft.saleEndAt) {
    return "Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc khuyến mãi.";
  }
  if (new Date(draft.saleEndAt) <= new Date(draft.saleStartAt)) {
    return "Thời gian kết thúc phải sau thời gian bắt đầu.";
  }

  return "";
}

export default function CoursePublishPage() {
  const [status, setStatus] = useState("PUBLISHED");
  const [courses, setCourses] = useState([]);
  const [saleDrafts, setSaleDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function load(nextStatus = status) {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminCourses({ status: nextStatus, size: 50 });
      const items = data?.items ?? [];
      setCourses(items);
      setSaleDrafts(() => {
        const nextDrafts = {};
        items.forEach((course) => {
          nextDrafts[course.id] = createDraft(course);
        });
        return nextDrafts;
      });
    } catch (err) {
      setError(err.message || "Không tải được danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(status);
  }, [status]);

  function updateDraft(courseId, field, value) {
    setSaleDrafts((current) => ({
      ...current,
      [courseId]: {
        ...current[courseId],
        [field]: value,
      },
    }));
  }

  async function changeVisibility(course) {
    if (busyId) return;
    setBusyId(course.id);
    setError("");
    try {
      if (course.status === "PUBLISHED") {
        await hideCourse(course.id);
      } else {
        await publishCourse(course.id);
      }
      await load();
    } catch (err) {
      setError(err.message || "Không cập nhật được trạng thái xuất bản.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveSale(course) {
    const draft = saleDrafts[course.id] ?? createDraft(course);
    const validationError = validateSaleDraft(course, draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusyId(course.id);
    setError("");
    try {
      await updateCourseSale(course.id, {
        salePrice: Number(draft.salePrice),
        saleStartAt: draft.saleStartAt,
        saleEndAt: draft.saleEndAt,
      });
      await load();
    } catch (err) {
      setError(err.message || "Không lưu được cấu hình khuyến mãi.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleClearSale(courseId) {
    setBusyId(courseId);
    setError("");
    try {
      await clearCourseSale(courseId);
      await load();
    } catch (err) {
      setError(err.message || "Không xóa được giá sale.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Xuất bản khóa học và quản lý giá sale</h2>
        <p className="page-description">
          Chỉ Admin mới được cấu hình khuyến mãi cho khóa học trả phí. Hệ thống sẽ tự quay về giá gốc khi hết thời gian sale.
        </p>
        <div className="course-filter-row">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="PUBLISHED">Đang xuất bản</option>
            <option value="HIDDEN">Đang ẩn</option>
            <option value="APPROVED">Đã duyệt</option>
          </select>
        </div>
      </section>

      {error && <p className="auth-error" role="alert">{error}</p>}

      <section className="course-table page-panel-card">
        {loading && <p className="auth-state">Đang tải danh sách khóa học...</p>}
        {!loading &&
          courses.map((course) => {
            const draft = saleDrafts[course.id] ?? createDraft(course);
            const canEditSale = course.courseType === "PAID";

            return (
              <div
                className="course-table-row"
                key={course.id}
                style={{ alignItems: "flex-start", gap: "1rem", paddingBlock: "1.25rem" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{course.title}</strong>
                  <p>{course.teacherName} · {course.status} · {course.courseType === "FREE" ? "Miễn phí" : "Trả phí"}</p>
                  <p>Giá gốc: <strong>{money.format(course.originalPrice || 0)}</strong></p>
                  <p>Giá sale: <strong>{course.salePrice != null ? money.format(course.salePrice) : "Chưa có"}</strong></p>
                  <p>Giá đang áp dụng: <strong>{money.format(course.currentPrice || 0)}</strong></p>
                  <p>
                    Thời gian áp dụng:{" "}
                    <strong>
                      {course.saleStartAt && course.saleEndAt
                        ? `${toDateTimeInput(course.saleStartAt).replace("T", " ")} - ${toDateTimeInput(course.saleEndAt).replace("T", " ")}`
                        : "Chưa thiết lập"}
                    </strong>
                  </p>
                  <p>Trạng thái sale: <strong>{saleStatusLabel(course.saleStatus)}</strong></p>

                  {canEditSale ? (
                    <div className="course-form-grid" style={{ marginTop: "1rem" }}>
                      <label>
                        Giá khuyến mãi
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={draft.salePrice}
                          onChange={(event) => updateDraft(course.id, "salePrice", event.target.value)}
                          placeholder="Nhập giá sale"
                        />
                      </label>
                      <label>
                        Bắt đầu khuyến mãi
                        <input
                          type="datetime-local"
                          value={draft.saleStartAt}
                          onChange={(event) => updateDraft(course.id, "saleStartAt", event.target.value)}
                        />
                      </label>
                      <label>
                        Kết thúc khuyến mãi
                        <input
                          type="datetime-local"
                          value={draft.saleEndAt}
                          onChange={(event) => updateDraft(course.id, "saleEndAt", event.target.value)}
                        />
                      </label>
                    </div>
                  ) : (
                    <p style={{ marginTop: "0.75rem" }}>Khóa học miễn phí không được phép tạo khuyến mãi.</p>
                  )}
                </div>

                <div className="course-row-actions" style={{ minWidth: "16rem" }}>
                  <button
                    type="button"
                    className={`page-action ${course.status === "PUBLISHED" ? "page-action-secondary" : "page-action-primary"}`}
                    disabled={busyId === course.id}
                    onClick={() => changeVisibility(course)}
                  >
                    {busyId === course.id ? "Đang lưu..." : course.status === "PUBLISHED" ? "Ẩn khóa học" : "Xuất bản"}
                  </button>
                  {canEditSale && (
                    <button
                      type="button"
                      className="page-action page-action-primary"
                      disabled={busyId === course.id}
                      onClick={() => handleSaveSale(course)}
                    >
                      {busyId === course.id ? "Đang lưu..." : "Lưu giá sale"}
                    </button>
                  )}
                  {canEditSale && course.salePrice != null && (
                    <button
                      type="button"
                      className="page-action page-action-secondary"
                      disabled={busyId === course.id}
                      onClick={() => handleClearSale(course.id)}
                    >
                      {busyId === course.id ? "Đang xóa..." : "Xóa giá sale"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        {!loading && courses.length === 0 && <p className="auth-state">Không có khóa học trong trạng thái này.</p>}
      </section>
    </div>
  );
}
