import { ToolHub } from "@/components/site/tool-hub";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

export const metadata = { title: "Image Tools — DevKit" };

export default function ImageToolsPage() {
  return <ToolHub category={TOOL_CATEGORIES.find((c) => c.id === "image-tools")!} />;
}
