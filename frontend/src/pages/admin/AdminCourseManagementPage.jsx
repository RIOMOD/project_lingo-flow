import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "../../context/ToastContext";
import {
  createChapter,
  createCourse,
  createLesson,
  deleteChapter,
  deleteCourse,
  deleteLesson,
  getAdminCourses,
  getCourseChapters,
  getTeacherCourseChapters,
  updateCourse,
  updateLesson,
} from "../../services/courseService";

function isVideoUrlBroken(url) {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (trimmed.length === 0) return true;
  // Only block obviously fake URLs
  if (trimmed.includes("example.com") || trimmed.includes("placeholder")) return true;

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
  if (!youtubeRegex.test(trimmed)) return true;

  // For youtube.com links, require a video id param (v=) or embed path
  if (trimmed.includes("youtube.com") && !trimmed.includes("v=") && !trimmed.includes("embed/")) {
    return true;
  }

  return false;
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

async function fetchChapters(courseId) {
  if (!courseId) return [];
  try {
    const res = await getTeacherCourseChapters(courseId);
    if (res) return res;
  } catch {
    // fallback
  }
  try {
    return (await getCourseChapters(courseId)) || [];
  } catch {
    return [];
  }
}

async function checkYouTubeVideoAvailability(url) {
  if (!url || typeof url !== "string" || !url.trim()) {
    return { isHealthy: false, message: "🔴 UNSET / NO VIDEO" };
  }

  const trimmed = url.trim();
  if (trimmed.includes("example.com") || trimmed.includes("placeholder")) {
    return { isHealthy: false, message: "🔴 BROKEN / FAKE URL" };
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;

  if (!videoId) {
    return { isHealthy: false, message: "🔴 INVALID YOUTUBE LINK" };
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return { isHealthy: true, message: "✅ HEALTHY OK", title: data.title };
    } else {
      return { isHealthy: false, message: "🔴 BROKEN / DELETED (Video 404)" };
    }
  } catch {
    return { isHealthy: true, message: "✅ HEALTHY OK (Valid Format)" };
  }
}

export default function AdminCourseManagementPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Inspector Full-Screen Modal state
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const scrollPositionRef = useRef(0);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalCourses: 0, totalLessons: 0, brokenVideos: 0, publishedCount: 0 });

  // View Detail Modal
  const [viewDetailCourse, setViewDetailCourse] = useState(null);

  // Editors & Modals
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    level: "BEGINNER",
    courseType: "FREE",
    originalPrice: 0,
    salePrice: 0,
  });

  const [editingCourseModal, setEditingCourseModal] = useState(null);
  const [courseMetaForm, setCourseMetaForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    level: "BEGINNER",
    courseType: "FREE",
    originalPrice: 0,
    salePrice: 0,
  });

  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");

  const [addingLessonChapterId, setAddingLessonChapterId] = useState(null);
  const [newLessonForm, setNewLessonForm] = useState({
    title: "",
    lessonType: "VIDEO",
    videoUrl: "",
    content: "",
    durationMinutes: 20,
  });

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLessonForm, setEditLessonForm] = useState({});
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  // AI Video Link Scanner states
  const [scanningVideos, setScanningVideos] = useState(false);
  const [aiHealthMap, setAiHealthMap] = useState({});

  // Bulk Link Editor states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLessonList, setBulkLessonList] = useState([]);
  const [bulkEditValues, setBulkEditValues] = useState({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [filterBrokenOnly, setFilterBrokenOnly] = useState(false);
  const [quickFillInput, setQuickFillInput] = useState("");

  // ESC key listener to exit any open modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setShowInspectorModal(false);
        setViewDetailCourse(null);
        setEditingCourseModal(null);
        setShowCreateCourseModal(false);
        setPreviewVideoUrl(null);
        setShowBulkModal(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!showInspectorModal) return;

    const previousScrollY = window.scrollY || window.pageYOffset || 0;
    scrollPositionRef.current = previousScrollY;

    const root = document.documentElement;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousLeft = body.style.left;
    const previousRight = body.style.right;
    const previousWidth = body.style.width;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${previousScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    root.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.left = previousLeft;
      body.style.right = previousRight;
      body.style.width = previousWidth;
      root.style.overflow = "";
      window.scrollTo({ top: scrollPositionRef.current, behavior: "auto" });
    };
  }, [showInspectorModal]);

  useEffect(() => {
    loadAllCourses();
  }, []);

  async function loadAllCourses() {
    setLoading(true);
    try {
      const data = await getAdminCourses({ size: 100 });
      const items = data?.items ?? [];
      setCourses(items);

      if (items.length > 0 && !selectedCourseId) {
        setSelectedCourseId(items[0].id);
      }

      // Compute system-wide video health & metrics in parallel
      let totalL = 0;
      let brokenV = 0;
      let pubCount = 0;

      await Promise.all(
        items.map(async (course) => {
          if (course.status === "PUBLISHED") pubCount++;
          try {
            const chs = await fetchChapters(course.id);
            (chs || []).forEach((ch) => {
              (ch.lessons || []).forEach((l) => {
                totalL++;
                if (isVideoUrlBroken(l.videoUrl)) {
                  brokenV++;
                }
              });
            });
          } catch {
            // Ignore
          }
        })
      );

      setStats({
        totalCourses: items.length,
        totalLessons: totalL,
        brokenVideos: brokenV,
        publishedCount: pubCount,
      });
    } catch (err) {
      toast.error("Lỗi nạp danh sách khóa học: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load Chapters for selected course
  useEffect(() => {
    if (!selectedCourseId) return;
    setLoadingChapters(true);
    fetchChapters(selectedCourseId)
      .then((data) => setChapters(data || []))
      .catch((err) => toast.error("Lỗi nạp danh sách chương: " + err.message))
      .finally(() => setLoadingChapters(false));
  }, [selectedCourseId]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  function openCourseInspector(courseId) {
    setSelectedCourseId(courseId);
    setShowInspectorModal(true);
  }

  // Checkbox handlers
  function toggleSelectAll() {
    if (selectedCheckboxes.size === filteredCourses.length && filteredCourses.length > 0) {
      setSelectedCheckboxes(new Set());
    } else {
      setSelectedCheckboxes(new Set(filteredCourses.map((c) => c.id)));
    }
  }

  function toggleSelectOne(id) {
    const next = new Set(selectedCheckboxes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCheckboxes(next);
  }

  // Bulk Actions
  async function handleBulkDelete() {
    if (!window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA ${selectedCheckboxes.size} khóa học đã chọn?`)) return;
    try {
      const selectedIds = Array.from(selectedCheckboxes);
      await Promise.all(selectedIds.map((id) => deleteCourse(id)));
      toast.success(`Đã xóa ${selectedIds.length} khóa học thành công.`);
      setSelectedCheckboxes(new Set());
      await loadAllCourses();
    } catch (err) {
      toast.error("Lỗi xóa hàng loạt: " + err.message);
    }
  }

  // Create Course
  async function handleCreateCourseSubmit(e) {
    e.preventDefault();
    if (!newCourseForm.title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        ...newCourseForm,
        slug: newCourseForm.slug || newCourseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        originalPrice: Number(newCourseForm.originalPrice),
        salePrice: Number(newCourseForm.salePrice),
      };
      await createCourse(payload);
      toast.success("Tạo khóa học thành công!");
      setShowCreateCourseModal(false);
      setNewCourseForm({
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        level: "BEGINNER",
        courseType: "FREE",
        originalPrice: 0,
        salePrice: 0,
      });
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi tạo khóa học: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Edit Course Modal
  function openEditCourseModal(course) {
    setEditingCourseModal(course);
    setCourseMetaForm({
      title: course.title || "",
      slug: course.slug || "",
      shortDescription: course.shortDescription || "",
      description: course.description || "",
      level: course.level || "BEGINNER",
      courseType: course.courseType || "FREE",
      originalPrice: course.originalPrice || 0,
      salePrice: course.salePrice || 0,
    });
  }

  async function handleSaveCourseMeta(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCourse(editingCourseModal.id, {
        ...courseMetaForm,
        originalPrice: Number(courseMetaForm.originalPrice),
        salePrice: Number(courseMetaForm.salePrice),
      });
      toast.success("Cập nhật thông tin khóa học thành công!");
      setEditingCourseModal(null);
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi cập nhật: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCourse(id, title) {
    if (!window.confirm(`XÓA KHÓA HỌC: "${title}"?\nThao tác này không thể hoàn tác.`)) return;
    try {
      await deleteCourse(id);
      toast.success("Đã xóa khóa học!");
      if (selectedCourseId === id) setSelectedCourseId(null);
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi xóa: " + err.message);
    }
  }

  // Chapter CRUD
  async function handleAddChapterSubmit(e) {
    e.preventDefault();
    if (!newChapterTitle.trim() || !selectedCourseId) return;

    try {
      await createChapter(selectedCourseId, {
        title: newChapterTitle.trim(),
        sortOrder: chapters.length + 1,
      });
      toast.success("Đã thêm chương mới!");
      setNewChapterTitle("");
      setAddingChapter(false);
      const chs = await fetchChapters(selectedCourseId);
      setChapters(chs || []);
    } catch (err) {
      toast.error("Lỗi thêm chương: " + err.message);
    }
  }

  async function handleDeleteChapter(chapterId) {
    if (!window.confirm("Xóa chương này và toàn bộ bài học bên trong?")) return;
    try {
      await deleteChapter(chapterId);
      toast.success("Đã xóa chương!");
      const chs = await fetchChapters(selectedCourseId);
      setChapters(chs || []);
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi xóa chương: " + err.message);
    }
  }

  // Lesson CRUD
  async function handleAddLessonSubmit(e) {
    e.preventDefault();
    if (!newLessonForm.title.trim() || !addingLessonChapterId) return;

    try {
      const ch = chapters.find((c) => c.id === addingLessonChapterId);
      const nextPos = (ch?.lessons?.length || 0) + 1;

      await createLesson(addingLessonChapterId, {
        ...newLessonForm,
        lessonType: newLessonForm.lessonType || "VIDEO",
        position: nextPos,
        durationMinutes: Number(newLessonForm.durationMinutes || 20),
        status: "DRAFT",
        preview: false,
      });
      toast.success("Đã thêm bài học mới!");
      setAddingLessonChapterId(null);
      setNewLessonForm({ title: "", lessonType: "VIDEO", videoUrl: "", content: "", durationMinutes: 20 });
      const chs = await fetchChapters(selectedCourseId);
      setChapters(chs || []);
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi thêm bài học: " + err.message);
    }
  }

  async function openBulkLinkModalForCourses(courseIds = null, brokenOnly = false) {
    const targetIds = courseIds || (selectedCheckboxes.size > 0 ? Array.from(selectedCheckboxes) : courses.map((c) => c.id));
    if (!targetIds || targetIds.length === 0) {
      toast.error("Không tìm thấy khóa học nào để sửa link.");
      return;
    }

    setLoading(true);

    // If opening broken-only view but haven’t run AI scan yet, auto-scan first
    let currentHealthMap = aiHealthMap;
    if (brokenOnly && Object.keys(currentHealthMap).length === 0) {
      toast.info("🤖 AI đang quét link YouTube trước khi mở danh sách...");
      setScanningVideos(true);
      try {
        const newMap = {};
        let brokenCount = 0;
        let totalLessons = 0;
        for (const course of courses) {
          const chs = await fetchChapters(course.id);
          for (const ch of (chs || [])) {
            for (const l of (ch.lessons || [])) {
              totalLessons++;
              const res = await checkYouTubeVideoAvailability(l.videoUrl);
              newMap[l.id] = res;
              if (!res.isHealthy) brokenCount++;
            }
          }
        }
        setAiHealthMap(newMap);
        setStats((prev) => ({ ...prev, brokenVideos: brokenCount }));
        currentHealthMap = newMap;
        toast.success(`🤖 AI Scan xong: tìm thấy ${brokenCount}/${totalLessons} video bị lỗi.`);
      } catch (err) {
        toast.error("Lỗi AI scan: " + err.message);
      } finally {
        setScanningVideos(false);
      }
    } else if (brokenOnly) {
      toast.info("⏳ Đang tổng hợp bài học từ các khóa học...");
    }

    try {
      const allLessons = [];
      const editMap = {};

      for (const id of targetIds) {
        const c = courses.find((item) => item.id === id);
        const chs = await fetchChapters(id);
        (chs || []).forEach((ch) => {
          (ch.lessons || []).forEach((l) => {
            // Use AI scan result if available (real 404/private check), otherwise fallback to format check
            const aiResult = currentHealthMap[l.id];
            const isBroken = aiResult ? !aiResult.isHealthy : isVideoUrlBroken(l.videoUrl);
            allLessons.push({
              id: l.id,
              courseId: id,
              courseTitle: c?.title || `Course #${id}`,
              chapterTitle: ch.title,
              title: l.title,
              lessonType: l.lessonType || "VIDEO",
              videoUrl: l.videoUrl || "",
              content: l.content || "",
              durationMinutes: l.durationMinutes || 20,
              position: l.position || 1,
              preview: Boolean(l.preview),
              status: l.status || "DRAFT",
              isBroken,
              aiStatus: aiResult?.message || null,
            });
            editMap[l.id] = l.videoUrl || "";
          });
        });
      }

      setBulkLessonList(allLessons);
      setBulkEditValues(editMap);
      setFilterBrokenOnly(brokenOnly);
      setShowBulkModal(true);
    } catch (err) {
      toast.error("Lỗi tổng hợp bài học: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBulkLinks() {
    if (bulkSaving) return;
    setBulkSaving(true);
    toast.info("⏳ Đang tiến hành lưu hàng loạt link video bài học...");

    let updatedCount = 0;
    try {
      const tasks = [];
      for (const lesson of bulkLessonList) {
        const newUrl = bulkEditValues[lesson.id]?.trim();
        if (newUrl !== undefined && newUrl !== (lesson.videoUrl || "")) {
          updatedCount++;
          tasks.push(
            updateLesson(lesson.id, {
              title: lesson.title,
              lessonType: lesson.lessonType,
              videoUrl: newUrl,
              content: lesson.content,
              durationMinutes: lesson.durationMinutes,
              position: lesson.position,
              preview: lesson.preview,
              status: lesson.status,
            })
          );
        }
      }

      if (tasks.length === 0) {
        toast.info("Không có link nào thay đổi.");
        setBulkSaving(false);
        return;
      }

      await Promise.all(tasks);
      toast.success(`🎉 Đã cập nhật thành công ${updatedCount} link video bài học!`);
      setShowBulkModal(false);

      if (selectedCourseId) {
        const chs = await fetchChapters(selectedCourseId);
        setChapters(chs || []);
      }
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi lưu hàng loạt: " + err.message);
    } finally {
      setBulkSaving(false);
    }
  }

  async function runSystemWideAiLinkScan() {
    if (scanningVideos) return;
    setScanningVideos(true);
    toast.info("🤖 AI đang quét & test trực tiếp toàn bộ link YouTube trên hệ thống...");

    let totalLessons = 0;
    let brokenCount = 0;
    const newMap = {};

    try {
      for (const course of courses) {
        const chs = await fetchChapters(course.id);
        for (const ch of (chs || [])) {
          for (const l of (ch.lessons || [])) {
            totalLessons++;
            const res = await checkYouTubeVideoAvailability(l.videoUrl);
            newMap[l.id] = res;
            if (!res.isHealthy) {
              brokenCount++;
            }
          }
        }
      }

      setAiHealthMap(newMap);
      setStats((prev) => ({
        ...prev,
        totalLessons: totalLessons || prev.totalLessons,
        brokenVideos: brokenCount,
      }));

      if (brokenCount > 0) {
        toast.error(`🤖 AI Scan Hoàn Tất: Đã test ${totalLessons} bài học. Báo đỏ 🔴 ${brokenCount} link bị hỏng/xóa trên hệ thống!`);
      } else {
        toast.success(`🤖 AI Scan Hoàn Tất: Tất cả ${totalLessons} video trên hệ thống đều hoạt động tốt! ✅`);
      }
    } catch (err) {
      toast.error("Lỗi khi chạy AI Scan: " + err.message);
    } finally {
      setScanningVideos(false);
    }
  }

  function handleQuickFillBroken(urlToFill) {
    if (!urlToFill?.trim()) {
      toast.error("Vui lòng nhập link YouTube trước khi chọn áp dụng.");
      return;
    }
    const newMap = { ...bulkEditValues };
    let count = 0;
    bulkLessonList.forEach((l) => {
      if (filterBrokenOnly ? l.isBroken : (l.isBroken || isVideoUrlBroken(newMap[l.id]))) {
        newMap[l.id] = urlToFill.trim();
        count++;
      }
    });
    setBulkEditValues(newMap);
    toast.success(`⚡ Đã tự động điền link mới vào ${count} bài học! Bấm "Lưu Tất Cả Thay Đổi" để lưu.`);
  }

  function startEditLesson(lesson) {
    setEditingLessonId(lesson.id);
    setEditLessonForm({
      title: lesson.title || "",
      lessonType: lesson.lessonType || "VIDEO",
      videoUrl: lesson.videoUrl || "",
      content: lesson.content || "",
      durationMinutes: lesson.durationMinutes || 20,
      position: lesson.position || lesson.sortOrder || 1,
      preview: lesson.preview ?? false,
      status: lesson.status || "DRAFT",
    });
  }

  async function runAiVideoHealthScan() {
    if (scanningVideos) return;
    setScanningVideos(true);
    toast.info("🤖 AI đang tiến hành quét & test toàn bộ link YouTube...");

    const newMap = {};
    let total = 0;
    let broken = 0;

    for (const ch of chapters) {
      for (const l of (ch.lessons || [])) {
        total++;
        const activeUrl = editingLessonId === l.id ? (editLessonForm.videoUrl ?? l.videoUrl) : l.videoUrl;
        const res = await checkYouTubeVideoAvailability(activeUrl);
        newMap[l.id] = res;
        if (!res.isHealthy) {
          broken++;
        }
      }
    }

    setAiHealthMap(newMap);
    setScanningVideos(false);

    if (broken > 0) {
      toast.error(`🤖 AI Scan Hoàn Tất: Đã quét ${total} bài học. Báo đỏ 🔴 ${broken} link bị hỏng/bị xóa!`);
    } else {
      toast.success(`🤖 AI Scan Hoàn Tất: Tất cả ${total} video đều hoạt động hoàn hảo! ✅`);
    }
  }

  async function handleSaveEditLesson(lessonId) {
    try {
      await updateLesson(lessonId, {
        title: editLessonForm.title?.trim() || "Untitled Lesson",
        lessonType: editLessonForm.lessonType || "VIDEO",
        videoUrl: editLessonForm.videoUrl?.trim() || "",
        content: editLessonForm.content || "",
        durationMinutes: Number(editLessonForm.durationMinutes || 20),
        position: Number(editLessonForm.position || 1),
        preview: Boolean(editLessonForm.preview),
        status: editLessonForm.status || "DRAFT",
      });
      toast.success("Cập nhật video bài học thành công!");
      setEditingLessonId(null);
      const chs = await fetchChapters(selectedCourseId);
      setChapters(chs || []);
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi lưu bài học: " + err.message);
    }
  }

  async function handleDeleteLesson(lessonId) {
    if (!window.confirm("Xóa bài học này?")) return;
    try {
      await deleteLesson(lessonId);
      toast.success("Đã xóa bài học!");
      const chs = await fetchChapters(selectedCourseId);
      setChapters(chs || []);
      loadAllCourses();
    } catch (err) {
      toast.error("Lỗi xóa bài học: " + err.message);
    }
  }

  // Filter & Pagination
  const filteredCourses = courses.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      (c.title || "").toLowerCase().includes(q) ||
      (c.teacherName || "").toLowerCase().includes(q) ||
      (c.shortDescription || "").toLowerCase().includes(q) ||
      (c.level || "").toLowerCase().includes(q);

    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchLevel = levelFilter === "ALL" || c.level === levelFilter;
    const matchType = typeFilter === "ALL" || c.courseType === typeFilter;

    return matchSearch && matchStatus && matchLevel && matchType;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="vocalyn-dashboard-container">
      {/* ── Top Header Cards Row (5 Vocalyn Metric Cards) ── */}
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Courses</span>
            <div className="metric-icon-circle">📚</div>
          </div>
          <div className="metric-val">{stats.totalCourses}</div>
          <div className="metric-change positive">
            <span>↑ Platform Catalog</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Lessons</span>
            <div className="metric-icon-circle">📖</div>
          </div>
          <div className="metric-val">{stats.totalLessons}</div>
          <div className="metric-change positive">
            <span>↑ From all chapters</span>
          </div>
        </div>

        <div
          className="vocalyn-card metric-card"
          style={{ cursor: "pointer" }}
          onClick={() => openBulkLinkModalForCourses(null, true)}
          title="Bấm để xem & sửa hàng loạt các video bị hỏng/thiếu link"
        >
          <div className="metric-card-top">
            <span className="metric-title">Video Health Status</span>
            <div className="metric-icon-circle" style={{ background: stats.brokenVideos > 0 ? "#fee2e2" : "#dcfce7" }}>
              {stats.brokenVideos > 0 ? "🔴" : "✅"}
            </div>
          </div>
          <div className="metric-val" style={{ color: stats.brokenVideos > 0 ? "#dc2626" : "#16a34a" }}>
            {stats.brokenVideos > 0 ? `${stats.brokenVideos} Broken` : "All Healthy"}
          </div>
          <div className={`metric-change ${stats.brokenVideos > 0 ? "negative" : "positive"}`}>
            <span>{stats.brokenVideos > 0 ? "↓ Action required (Click to Fix)" : "↑ 100% Valid"}</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Published Courses</span>
            <div className="metric-icon-circle">🌟</div>
          </div>
          <div className="metric-val">{stats.publishedCount}</div>
          <div className="metric-change positive">
            <span>↑ Active on Store</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Filter Results</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filteredCourses.length}</div>
          <div className="metric-change positive">
            <span>↑ Matched</span>
          </div>
        </div>
      </div>

      {/* ── Main Data Card Table (Vocalyn Style) ── */}
      <div className="vocalyn-card main-table-card">
        {/* Bulk Action Bar */}
        {selectedCheckboxes.size > 0 && (
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "10px 16px",
            borderRadius: "10px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px"
          }}>
            <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "0.9rem" }}>
              ☑️ Đã chọn <span style={{ color: "#2563eb", fontSize: "1rem" }}>{selectedCheckboxes.size}</span> khóa học:
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="vocalyn-btn-pill"
                onClick={() => openBulkLinkModalForCourses(Array.from(selectedCheckboxes))}
                style={{ fontSize: "0.78rem", padding: "4px 14px", backgroundColor: "#8b5cf6", color: "#ffffff", border: "none" }}
              >
                ✏️ Sửa Link Video Hàng Loạt ({selectedCheckboxes.size} khóa)
              </button>
              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-danger"
                onClick={handleBulkDelete}
                style={{ fontSize: "0.78rem", padding: "4px 12px" }}
              >
                🗑️ Xóa Tất Cả Đã Chọn
              </button>
              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-secondary"
                onClick={() => setSelectedCheckboxes(new Set())}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                ✖ Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Table Toolbar */}
        <div className="vocalyn-table-toolbar">
          <div className="toolbar-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, description, level or teacher..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="toolbar-actions">
            <select
              className="vocalyn-btn-pill vocalyn-btn-secondary"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="HIDDEN">HIDDEN</option>
              <option value="DRAFT">DRAFT</option>
            </select>

            <select
              className="vocalyn-btn-pill vocalyn-btn-secondary"
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Levels</option>
              <option value="BEGINNER">BEGINNER</option>
              <option value="ELEMENTARY">ELEMENTARY</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>

            <button
              type="button"
              className="vocalyn-btn-pill"
              disabled={scanningVideos}
              onClick={runSystemWideAiLinkScan}
              style={{
                backgroundColor: scanningVideos ? "#64748b" : "#8b5cf6",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                padding: "8px 16px",
                fontSize: "0.88rem",
                cursor: scanningVideos ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.35)",
              }}
              title="Chạy AI quét trực tiếp tính khả dụng của toàn bộ video YouTube trên hệ thống"
            >
              {scanningVideos ? "🤖 AI Scanning..." : "🤖 AI Check Link Toàn Hệ Thống"}
            </button>

            <button
              type="button"
              className="vocalyn-btn-pill"
              onClick={() => openBulkLinkModalForCourses(null, true)}
              style={{
                backgroundColor: stats.brokenVideos > 0 ? "#dc2626" : "#0284c7",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                padding: "8px 16px",
                fontSize: "0.88rem",
                boxShadow: stats.brokenVideos > 0 ? "0 4px 12px rgba(220, 38, 38, 0.35)" : "0 4px 12px rgba(2, 132, 199, 0.3)",
              }}
              title="Mở trình sửa link hàng loạt cho các khóa học bị lỗi"
            >
              {stats.brokenVideos > 0 ? `🛠️ Sửa Khóa Lỗi Link (${stats.brokenVideos})` : "✏️ Sửa Link Hàng Loạt"}
            </button>
            <button
              type="button"
              className="vocalyn-btn-pill vocalyn-btn-primary"
              onClick={() => setShowCreateCourseModal(true)}
            >
              ➕ Create Course
            </button>
          </div>
        </div>

        {/* Vocalyn Data Table */}
        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selectedCheckboxes.size === filteredCourses.length && filteredCourses.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Course Name ⇅</th>
                <th>Level & Type ⇅</th>
                <th>Teacher ⇅</th>
                <th>Status ⇅</th>
                <th>Price ⇅</th>
                <th className="text-right">Actions ⇅</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-4">Loading Courses Data...</td>
                </tr>
              ) : paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-4">No matching courses found.</td>
                </tr>
              ) : (
                paginatedCourses.map((c) => {
                  const isChecked = selectedCheckboxes.has(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={isChecked ? "is-checked-row" : ""}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(c.id)}
                        />
                      </td>

                      <td style={{ cursor: "pointer" }} onClick={() => openCourseInspector(c.id)}>
                        <div className="table-title-cell">
                          <strong className="course-name-text">{c.title}</strong>
                          <span className="course-sub-text">{c.shortDescription || "English Learning Course"}</span>
                        </div>
                      </td>

                      <td>
                        <span className="vocalyn-tag tag-level">{c.level}</span>
                        <span className="vocalyn-tag tag-type" style={{ marginLeft: "4px" }}>{c.courseType}</span>
                      </td>

                      <td>
                        <div className="teacher-cell">
                          <span className="teacher-avatar">{c.teacherName ? c.teacherName[0].toUpperCase() : "T"}</span>
                          <span>{c.teacherName || "Teacher"}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`vocalyn-status-pill status-${c.status?.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>

                      <td>
                        <strong>{c.currentPrice ? `${c.currentPrice.toLocaleString()}đ` : "Free"}</strong>
                      </td>

                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="vocalyn-action-buttons">
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title="Mở toàn màn hình Quản lý Chương & Bài Học (Inspector)"
                            onClick={() => openCourseInspector(c.id)}
                          >
                            📖
                          </button>
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title="Xem chi tiết đầy đủ"
                            onClick={() => setViewDetailCourse(c)}
                          >
                            👁️
                          </button>
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title="Chỉnh sửa thông tin"
                            onClick={() => openEditCourseModal(c)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title="Xóa khóa học"
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="vocalyn-table-footer">
          <span className="footer-count-text">
            Showing {filteredCourses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} Courses
          </span>

          <div className="vocalyn-pagination">
            <button
              type="button"
              className="page-num-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`page-num-btn ${currentPage === p ? "is-active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="page-num-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── PORTAL FULL-SCREEN ABSOLUTELY CENTERED MODAL (FLAWLESS VIEWPORT CENTERING) ── */}
      {showInspectorModal && selectedCourse && createPortal(
        <div
          onClick={() => setShowInspectorModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999999,
            background: "rgba(15, 23, 42, 0.82)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {/* Modal Dialog Card (Dynamic Auto Centered inside Viewport) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90vw",
              maxWidth: "1320px",
              maxHeight: "84vh",
              margin: "auto",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxSizing: "border-box",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            {/* Modal Header Sticky */}
            <div
              style={{
                flexShrink: 0,
                padding: "16px 28px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ffffff",
                borderRadius: "20px 20px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span className="vocalyn-tag tag-level" style={{ fontSize: "0.88rem", padding: "5px 12px" }}>{selectedCourse.level}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
                    📖 {selectedCourse.title} — Chapter & Lesson Inspector
                  </h2>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {selectedCourse.shortDescription || selectedCourse.description}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="vocalyn-btn-pill"
                  style={{
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 700,
                    padding: "8px 14px",
                    fontSize: "0.88rem",
                  }}
                  onClick={() => openBulkLinkModalForCourses([selectedCourseId])}
                  title="Sửa link video cho tất cả bài học trong khóa học này"
                >
                  ✏️ Sửa Hàng Loạt
                </button>
                <button
                  type="button"
                  className="vocalyn-btn-pill"
                  style={{
                    backgroundColor: scanningVideos ? "#64748b" : "#8b5cf6",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 700,
                    padding: "8px 16px",
                    fontSize: "0.88rem",
                    cursor: scanningVideos ? "wait" : "pointer",
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  disabled={scanningVideos}
                  onClick={runAiVideoHealthScan}
                  title="Chạy AI quét tự động tính khả dụng của toàn bộ video YouTube"
                >
                  {scanningVideos ? "🤖 AI Scanning..." : "🤖 AI Check Video Links"}
                </button>

                {!addingChapter ? (
                  <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => setAddingChapter(true)} style={{ padding: "8px 18px", fontSize: "0.9rem" }}>
                    ➕ Add New Chapter
                  </button>
                ) : (
                  <form onSubmit={handleAddChapterSubmit} style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      required
                      placeholder="Tên chương mới..."
                      className="vocalyn-input-pill"
                      style={{ padding: "6px 12px" }}
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                    />
                    <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary">Save</button>
                    <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setAddingChapter(false)}>Hủy</button>
                  </form>
                )}
                <button
                  type="button"
                  onClick={() => setShowInspectorModal(false)}
                  style={{
                    fontSize: "1.4rem",
                    width: "36px",
                    height: "36px",
                    border: "none",
                    background: "#f1f5f9",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#475569",
                  }}
                  title="Đóng cửa sổ (ESC hoặc Bấm ra ngoài)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body Scrollable */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 28px", background: "#f8fafc" }}>
              {loadingChapters ? (
                <div className="p-4 text-center" style={{ fontSize: "1.1rem", color: "#64748b" }}>Đang tải danh sách chương...</div>
              ) : chapters.length === 0 ? (
                <div className="p-4 text-center" style={{ fontSize: "1.1rem", color: "#64748b" }}>Khóa học này chưa có chương nào được tạo. Nhấn "➕ Add New Chapter" để tạo chương đầu tiên!</div>
              ) : (
                chapters.map((ch, chIdx) => (
                  <div key={ch.id} style={{ marginBottom: "1.6rem", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "12px" }}>
                      <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>Chapter {chIdx + 1}: {ch.title}</strong>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="vocalyn-btn-pill vocalyn-btn-secondary"
                          style={{ fontSize: "0.85rem", padding: "5px 14px" }}
                          onClick={() => setAddingLessonChapterId(addingLessonChapterId === ch.id ? null : ch.id)}
                        >
                          ➕ Add Lesson
                        </button>
                        <button
                          type="button"
                          className="vocalyn-icon-btn"
                          title="Xóa chương"
                          onClick={() => handleDeleteChapter(ch.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Add Lesson inline form */}
                    {addingLessonChapterId === ch.id && (
                      <form onSubmit={handleAddLessonSubmit} style={{ background: "#f1f5f9", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <input
                            type="text"
                            required
                            placeholder="Tên bài học mới..."
                            className="vocalyn-input-pill"
                            style={{ width: "100%" }}
                            value={newLessonForm.title}
                            onChange={(e) => setNewLessonForm({ ...newLessonForm, title: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="Link YouTube Video (https://www.youtube.com/watch?v=...)"
                            className="vocalyn-input-pill"
                            style={{ width: "100%" }}
                            value={newLessonForm.videoUrl}
                            onChange={(e) => setNewLessonForm({ ...newLessonForm, videoUrl: e.target.value })}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setAddingLessonChapterId(null)}>Hủy</button>
                          <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary">Lưu Bài Học</button>
                        </div>
                      </form>
                    )}

                    {/* Lessons table */}
                    <table className="vocalyn-data-table" style={{ fontSize: "0.9rem", background: "#ffffff", borderRadius: "8px" }}>
                      <thead>
                        <tr>
                          <th>LESSON TITLE</th>
                          <th>VIDEO URL</th>
                          <th>VIDEO HEALTH STATUS</th>
                          <th className="text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(ch.lessons || []).map((l) => {
                          const activeVideoUrl = editingLessonId === l.id ? (editLessonForm.videoUrl ?? l.videoUrl) : l.videoUrl;
                          const aiResult = aiHealthMap[l.id];
                          const isBroken = aiResult ? !aiResult.isHealthy : isVideoUrlBroken(activeVideoUrl);
                          const statusLabel = aiResult ? aiResult.message : (isBroken ? "🔴 BROKEN / INVALID" : "✅ HEALTHY OK");
                          const embedUrl = getYouTubeEmbedUrl(activeVideoUrl);

                          return (
                            <tr
                              key={l.id}
                              style={{
                                backgroundColor: isBroken ? "#fef2f2" : "transparent",
                                transition: "background 0.3s ease",
                              }}
                            >
                              <td>
                                {editingLessonId === l.id ? (
                                  <input
                                    type="text"
                                    className="vocalyn-input-pill"
                                    style={{ width: "100%" }}
                                    value={editLessonForm.title}
                                    onChange={(e) => setEditLessonForm({ ...editLessonForm, title: e.target.value })}
                                  />
                                ) : (
                                  <strong style={{ fontSize: "0.95rem", color: isBroken ? "#991b1b" : "#0f172a" }}>
                                    {isBroken ? "⚠️ " : ""}{l.title}
                                  </strong>
                                )}
                              </td>

                              <td>
                                {editingLessonId === l.id ? (
                                  <input
                                    type="text"
                                    className="vocalyn-input-pill"
                                    style={{ width: "100%" }}
                                    value={editLessonForm.videoUrl}
                                    onChange={(e) => setEditLessonForm({ ...editLessonForm, videoUrl: e.target.value })}
                                  />
                                ) : (
                                  <small style={{ color: isBroken ? "#dc2626" : "#2563eb", fontWeight: 600, fontSize: "0.85rem" }}>
                                    {activeVideoUrl || "No Video"}
                                  </small>
                                )}
                              </td>

                              <td>
                                <span className={`vocalyn-status-pill ${isBroken ? "status-broken" : "status-healthy"}`} style={{ fontWeight: 700 }}>
                                  {statusLabel}
                                </span>
                              </td>

                              <td className="text-right">
                                <div className="vocalyn-action-buttons">
                                  {embedUrl && (
                                    <button
                                      type="button"
                                      className="vocalyn-icon-btn"
                                      title="Xem trước Video YouTube"
                                      onClick={() => setPreviewVideoUrl(embedUrl)}
                                    >
                                      ▶️
                                    </button>
                                  )}

                                  {editingLessonId === l.id ? (
                                    <button
                                      type="button"
                                      className="vocalyn-btn-pill vocalyn-btn-primary"
                                      style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                                      onClick={() => handleSaveEditLesson(l.id)}
                                    >
                                      💾 Save
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="vocalyn-icon-btn"
                                      title="Sửa bài học"
                                      onClick={() => startEditLesson(l)}
                                    >
                                      ✏️
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    className="vocalyn-icon-btn"
                                    title="Xóa bài học"
                                    onClick={() => handleDeleteLesson(l.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ flexShrink: 0, borderTop: "1px solid #e2e8f0", padding: "14px 28px", background: "#ffffff", borderRadius: "0 0 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>💡 Mẹo nhanh: Nhấn phím <strong>ESC</strong> hoặc click ra ngoài vùng tối để thoát.</span>
              <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setShowInspectorModal(false)} style={{ padding: "8px 24px" }}>
                Đóng Cửa Sổ (ESC)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── VIEW DETAIL COURSE MODAL ── */}
      {viewDetailCourse && (
        <div className="lb-overlay" onClick={() => setViewDetailCourse(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="lb-modal-header">
              <h3>👁️ Chi Tiết Khóa Học #{viewDetailCourse.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewDetailCourse(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              {viewDetailCourse.thumbnailUrl && (
                <img
                  src={viewDetailCourse.thumbnailUrl}
                  alt="thumbnail"
                  style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }}
                />
              )}

              <div>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{viewDetailCourse.title}</h4>
                <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "2px" }}>Slug: /{viewDetailCourse.slug}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><strong>Cấp độ:</strong> <span className="vocalyn-tag tag-level">{viewDetailCourse.level}</span></div>
                <div><strong>Loại khóa học:</strong> <span className="vocalyn-tag tag-type">{viewDetailCourse.courseType}</span></div>
                <div><strong>Giảng viên:</strong> {viewDetailCourse.teacherName || "N/A"}</div>
                <div><strong>Trạng thái:</strong> <span className={`vocalyn-status-pill status-${viewDetailCourse.status?.toLowerCase()}`}>{viewDetailCourse.status}</span></div>
                <div><strong>Giá gốc:</strong> {viewDetailCourse.originalPrice ? `${Number(viewDetailCourse.originalPrice).toLocaleString()}đ` : "Free"}</div>
                <div><strong>Giá Sale:</strong> {viewDetailCourse.salePrice ? `${Number(viewDetailCourse.salePrice).toLocaleString()}đ` : "Chưa đặt"}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                <strong>Mô tả ngắn:</strong>
                <p style={{ margin: "4px 0 0", color: "#475569" }}>{viewDetailCourse.shortDescription || "Chưa có mô tả"}</p>
              </div>

              <div className="lb-modal-footer" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="vocalyn-btn-pill vocalyn-btn-primary"
                  onClick={() => {
                    openEditCourseModal(viewDetailCourse);
                    setViewDetailCourse(null);
                  }}
                >
                  ✏️ Chỉnh Sửa Thông Tin
                </button>
                <button
                  type="button"
                  className="vocalyn-btn-pill vocalyn-btn-secondary"
                  onClick={() => {
                    openCourseInspector(viewDetailCourse.id);
                    setViewDetailCourse(null);
                  }}
                >
                  📖 Mở Inspector Toàn Màn Hình
                </button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewDetailCourse(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE COURSE MODAL ── */}
      {showCreateCourseModal && (
        <div className="lb-overlay" onClick={() => !saving && setShowCreateCourseModal(false)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="lb-modal-header">
              <h3>➕ Tạo Khóa Học Mới</h3>
              <button type="button" className="lb-modal-close" onClick={() => setShowCreateCourseModal(false)}>x</button>
            </div>
            <form onSubmit={handleCreateCourseSubmit} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Tên Khóa Học (*):
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: IELTS Writing Task 2 Intensive"
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Trình độ:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={newCourseForm.level}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, level: e.target.value })}
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="ELEMENTARY">ELEMENTARY</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Loại khóa học:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={newCourseForm.courseType}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, courseType: e.target.value })}
                  >
                    <option value="FREE">FREE (Miễn phí)</option>
                    <option value="PAID">PAID (Trả phí)</option>
                  </select>
                </label>
              </div>

              {newCourseForm.courseType === "PAID" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Giá gốc (VNĐ):
                    <input
                      type="number"
                      className="vocalyn-input-pill"
                      style={{ width: "100%", marginTop: "2px" }}
                      value={newCourseForm.originalPrice}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, originalPrice: e.target.value })}
                    />
                  </label>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Giá Sale (VNĐ):
                    <input
                      type="number"
                      className="vocalyn-input-pill"
                      style={{ width: "100%", marginTop: "2px" }}
                      value={newCourseForm.salePrice}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, salePrice: e.target.value })}
                    />
                  </label>
                </div>
              )}

              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mô tả ngắn:
                <input
                  type="text"
                  placeholder="Mô tả ngắn hiển thị trên thẻ..."
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={newCourseForm.shortDescription}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, shortDescription: e.target.value })}
                />
              </label>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setShowCreateCourseModal(false)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary" disabled={saving}>{saving ? "Đang tạo..." : "➕ Tạo Khóa Học"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT COURSE MODAL ── */}
      {editingCourseModal && (
        <div className="lb-overlay" onClick={() => !saving && setEditingCourseModal(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="lb-modal-header">
              <h3>✏️ Chỉnh Sửa Khóa Học #{editingCourseModal.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setEditingCourseModal(null)}>x</button>
            </div>
            <form onSubmit={handleSaveCourseMeta} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Tên Khóa Học (*):
                <input
                  type="text"
                  required
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={courseMetaForm.title}
                  onChange={(e) => setCourseMetaForm({ ...courseMetaForm, title: e.target.value })}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Trình độ:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={courseMetaForm.level}
                    onChange={(e) => setCourseMetaForm({ ...courseMetaForm, level: e.target.value })}
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="ELEMENTARY">ELEMENTARY</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Loại khóa học:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={courseMetaForm.courseType}
                    onChange={(e) => setCourseMetaForm({ ...courseMetaForm, courseType: e.target.value })}
                  >
                    <option value="FREE">FREE (Miễn phí)</option>
                    <option value="PAID">PAID (Trả phí)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Giá gốc (VNĐ):
                  <input
                    type="number"
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={courseMetaForm.originalPrice}
                    onChange={(e) => setCourseMetaForm({ ...courseMetaForm, originalPrice: e.target.value })}
                  />
                </label>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Giá Sale (VNĐ):
                  <input
                    type="number"
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={courseMetaForm.salePrice}
                    onChange={(e) => setCourseMetaForm({ ...courseMetaForm, salePrice: e.target.value })}
                  />
                </label>
              </div>

              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mô tả ngắn:
                <input
                  type="text"
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={courseMetaForm.shortDescription}
                  onChange={(e) => setCourseMetaForm({ ...courseMetaForm, shortDescription: e.target.value })}
                />
              </label>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setEditingCourseModal(null)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu Thay Đổi"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── YOUTUBE VIDEO PREVIEW MODAL (TOP-MOST LAYER PORTAL) ── */}
      {previewVideoUrl && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 99999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={() => setPreviewVideoUrl(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "760px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a", fontWeight: 700 }}>▶️ Preview Video Bài Giảng</h3>
              <button
                type="button"
                onClick={() => setPreviewVideoUrl(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  color: "#64748b",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "0", backgroundColor: "#000000" }}>
              <iframe
                src={previewVideoUrl}
                title="Video Preview"
                style={{ width: "100%", height: "420px", border: "none", display: "block" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── BULK VIDEO LINK EDITOR MODAL (TOP PORTAL) ── */}
      {showBulkModal && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 99999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={() => setShowBulkModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "92vw",
              maxWidth: "1280px",
              maxHeight: "88vh",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                  ✏️ Trình Quản Lý & Sửa Link Video Hàng Loạt
                </h2>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Đang hiển thị {bulkLessonList.length} bài học. Bạn có thể sửa link trực tiếp hoặc dán tự động.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "#475569",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>

            {/* Quick Replace Toolbar */}
            <div style={{ padding: "16px 28px", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filterBrokenOnly}
                  onChange={(e) => setFilterBrokenOnly(e.target.checked)}
                />
                🔴 Chỉ hiện các link bị lỗi / trống
              </label>

              <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Dán link YouTube mới vào đây..."
                  className="vocalyn-input-pill"
                  style={{ width: "320px", fontSize: "0.85rem" }}
                  value={quickFillInput}
                  onChange={(e) => setQuickFillInput(e.target.value)}
                />
                <button
                  type="button"
                  className="vocalyn-btn-pill"
                  style={{ backgroundColor: "#8b5cf6", color: "#ffffff", border: "none", fontSize: "0.82rem" }}
                  onClick={() => handleQuickFillBroken(quickFillInput)}
                >
                  ⚡ Điền Nhanh Vào Link Hỏng
                </button>
              </div>
            </div>

            {/* Lesson List Table */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
              <table className="vocalyn-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>KHÓA HỌC</th>
                    <th style={{ width: "25%" }}>TÊN BÀI HỌC</th>
                    <th style={{ width: "18%" }}>TRẠNG THÁI VIDEO</th>
                    <th style={{ width: "37%" }}>INPUT LINK VIDEO YOUTUBE MỚI</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkLessonList
                    .filter((l) => !filterBrokenOnly || l.isBroken)
                    .map((l) => {
                      const currentVal = bulkEditValues[l.id] ?? l.videoUrl;
                      const isCurrentlyBroken = isVideoUrlBroken(currentVal);
                      const isModified = bulkEditValues[l.id] !== undefined && bulkEditValues[l.id] !== (l.videoUrl || "");

                      return (
                        <tr
                          key={l.id}
                          style={{
                            backgroundColor: isModified ? "#eff6ff" : (isCurrentlyBroken ? "#fef2f2" : "transparent"),
                            transition: "background 0.3s ease",
                          }}
                        >
                          <td>
                            <strong style={{ fontSize: "0.85rem", color: "#334155" }}>{l.courseTitle}</strong>
                            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{l.chapterTitle}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: "0.9rem", color: isCurrentlyBroken ? "#991b1b" : "#0f172a" }}>
                              {isCurrentlyBroken ? "⚠️ " : (isModified ? "✨ " : "")}{l.title}
                            </strong>
                          </td>
                          <td>
                            {isModified ? (
                              <span className="vocalyn-status-pill" style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}>
                                ✏️ ĐÃ ĐỔI LINK MỚI
                              </span>
                            ) : l.aiStatus ? (
                              <span className="vocalyn-status-pill" style={{ background: isCurrentlyBroken ? "#fef2f2" : "#f0fdf4", color: isCurrentlyBroken ? "#991b1b" : "#15803d", fontWeight: 700, fontSize: "0.75rem" }}>
                                {isCurrentlyBroken ? "🔴 " : "✅ "}{l.aiStatus}
                              </span>
                            ) : (
                              <span className={`vocalyn-status-pill ${isCurrentlyBroken ? "status-broken" : "status-healthy"}`} style={{ fontWeight: 700 }}>
                                {isCurrentlyBroken ? "🔴 BROKEN / UNSET" : "✅ HEALTHY OK"}
                              </span>
                            )}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="vocalyn-input-pill"
                              style={{ width: "100%", fontSize: "0.85rem", borderColor: isCurrentlyBroken ? "#fca5a5" : "#cbd5e1" }}
                              value={bulkEditValues[l.id] ?? ""}
                              onChange={(e) => setBulkEditValues({ ...bulkEditValues, [l.id]: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 28px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setShowBulkModal(false)}>
                Hủy
              </button>
              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-primary"
                disabled={bulkSaving}
                onClick={handleSaveBulkLinks}
                style={{ padding: "10px 24px", fontSize: "0.95rem" }}
              >
                {bulkSaving ? "⏳ Đang Lưu Hàng Loạt..." : "💾 Lưu Tất Cả Thay Đổi"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
