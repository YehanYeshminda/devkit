import { ToolHub } from "@/components/site/tool-hub";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

export const metadata = { title: "Developer Tools — DevKit" };

export default function DevToolsPage() {
  return <ToolHub category={TOOL_CATEGORIES.find((c) => c.id === "dev-tools")!} />;
}
