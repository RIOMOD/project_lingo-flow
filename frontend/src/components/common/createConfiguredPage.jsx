import PageTemplate from "./PageTemplate";
import { demoPaths, pageConfigs } from "../../config/navigation";

export function createConfiguredPage(pageKey) {
  function ConfiguredPage() {
    const config = pageConfigs[pageKey];

    if (!config) {
      return (
        <PageTemplate
          roleKey="guest"
          title="Missing page config"
          description={`Khong tim thay cau hinh cho key: ${pageKey}.`}
          actions={[
            { label: "Ve trang chu", to: demoPaths.home, tone: "primary" },
            {
              label: "Mo dashboard student",
              to: demoPaths.studentDashboard,
              tone: "secondary",
            },
          ]}
          panels={[
            {
              title: "Huong xu ly",
              items: [
                "Kiem tra pageKey duoc truyen vao file page.",
                "Doi chieu key trong pageConfigs cua navigation.js.",
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
