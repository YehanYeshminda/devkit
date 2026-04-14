import { ToolHub } from "@/components/site/tool-hub";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";
export const metadata = { title: "Code Snippets — DevKit" };
export default function SnippetsPage() {
  return <ToolHub category={TOOL_CATEGORIES.find(c => c.id === "snippets")!} />;
}
