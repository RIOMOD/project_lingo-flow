import PageTemplate from "./PageTemplate";
import { demoPaths, pageConfigs } from "../../config/navigation";

export function createConfiguredPage(pageKey) {
  function ConfiguredPage() {
    const config = pageConfigs[pageKey];

    if (!config) {
      return (
        <PageTemplate
          roleKey="guest"
          title="Không tìm thấy cấu hình trang"
          description={`Không tìm thấy cấu hình cho khóa: ${pageKey}.`}
          actions={[
            { label: "Về trang chủ", to: demoPaths.home, tone: "primary" },
            {
              label: "Mở trang Học viên",
              to: demoPaths.studentDashboard,
              tone: "secondary",
            },
          ]}
          panels={[
            {
              title: "Hướng xử lý",
              items: [
                "Kiểm tra pageKey được truyền vào file page.",
                "Đối chiếu key trong pageConfigs của navigation.js.",
              ],
            },
          ]}
        />
      );
    }

    return <PageTemplate {...config} />;
  }

  ConfiguredPage.displayName = `${pageKey}Page`;

  return ConfiguredPage;
}
