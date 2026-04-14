import { ToolHub } from "@/components/site/tool-hub";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

export const metadata = { title: "PDF Tools — DevKit" };

export default function PdfToolsPage() {
  return <ToolHub category={TOOL_CATEGORIES.find((c) => c.id === "pdf-tools")!} />;
}
