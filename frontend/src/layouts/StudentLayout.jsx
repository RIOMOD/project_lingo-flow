import AppShell from "../components/common/AppShell";
import AiLimo from "../components/student/AiLimo";
import { AiLimoProvider } from "../context/AiLimoContext";

export default function StudentLayout() {
  return (
    <AiLimoProvider>
      <AppShell roleKey="student" />
      <AiLimo />
    </AiLimoProvider>
  );
}
