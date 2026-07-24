import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { LoadingState, ErrorState } from "../components/common/UiState";
import { getCourseAccess } from "../services/courseService";

export default function CourseAccessRoute() {
  const { courseId } = useParams();
  const [state, setState] = useState({ loading: true, allowed: false, error: "" });

  useEffect(() => {
    let mounted = true;
    setState({ loading: true, allowed: false, error: "" });

    getCourseAccess(courseId)
      .then((access) => {
        if (mounted) setState({ loading: false, allowed: Boolean(access?.owned || access?.previewAllowed), error: "" });
      })
      .catch((error) => {
        if (mounted) setState({ loading: false, allowed: false, error: error.message });
      });

    return () => {
      mounted = false;
    };
  }, [courseId]);

  if (state.loading) {
    return <LoadingState title="Đang kiểm tra quyền học..." />;
  }

  if (state.error) {
    return <ErrorState description={state.error} />;
  }

  if (!state.allowed) {
    return <Navigate to="/courses" replace />;
  }

  return <Outlet />;
}
