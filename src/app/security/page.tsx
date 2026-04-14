import { ToolHub } from "@/components/site/tool-hub";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

export const metadata = { title: "Security Tools — DevKit" };

export default function SecurityPage() {
  return <ToolHub category={TOOL_CATEGORIES.find((c) => c.id === "security")!} />;
}
