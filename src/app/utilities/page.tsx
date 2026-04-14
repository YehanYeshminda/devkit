import { ToolHub } from "@/components/site/tool-hub";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

export const metadata = { title: "Utilities — DevKit" };

export default function UtilitiesPage() {
  return <ToolHub category={TOOL_CATEGORIES.find((c) => c.id === "utilities")!} />;
}
