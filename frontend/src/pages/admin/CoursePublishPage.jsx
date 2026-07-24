import { useEffect, useState } from "react";
import { getAdminCourses, hideCourse, publishCourse } from "../../services/courseService";

export default function CoursePublishPage() {
  const [status, setStatus] = useState("PUBLISHED");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function load(nextStatus = status) {
    setLoading(true); setError("");
    try {
      const data = await getAdminCourses({ status: nextStatus, size: 50 });
      setCourses(data?.items ?? []);
    } catch (err) { setError(err.message || "Không tải được danh sách khóa học."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(status); }, [status]);

  async function changeVisibility(course) {
    if (busyId) return;
    setBusyId(course.id); setError("");
    try {
      if (course.status === "PUBLISHED") await hideCourse(course.id);
      else await publishCourse(course.id);
      await load();
    } catch (err) { setError(err.message || "Không cập nhật được trạng thái xuất bản."); }
    finally { setBusyId(null); }
  }

  return <div className="course-page">
    <section className="page-hero"><span className="page-badge">Admin</span><h2 className="page-title">Xuất bản khóa học</h2>
      <p className="page-description">Danh sách được tải từ backend; thay đổi trạng thái được lưu và tồn tại sau reload.</p>
      <div className="course-filter-row"><select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="PUBLISHED">Đang xuất bản</option><option value="HIDDEN">Đang ẩn</option><option value="APPROVED">Đã duyệt</option>
      </select></div>
    </section>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <section className="course-table page-panel-card">
      {loading && <p className="auth-state">Đang tải...</p>}
      {!loading && courses.map((course) => <div className="course-table-row" key={course.id}>
        <div><strong>{course.title}</strong><p>{course.teacherName} · {course.status}</p></div>
        <button className={`page-action ${course.status === "PUBLISHED" ? "page-action-secondary" : "page-action-primary"}`} disabled={busyId === course.id} onClick={() => changeVisibility(course)}>
          {busyId === course.id ? "Đang lưu..." : course.status === "PUBLISHED" ? "Ẩn khóa học" : "Xuất bản"}
        </button>
      </div>)}
      {!loading && courses.length === 0 && <p className="auth-state">Không có khóa học trong trạng thái này.</p>}
    </section>
  </div>;
}
