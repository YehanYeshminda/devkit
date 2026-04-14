import { ToolHub } from "@/components/site/tool-hub";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

export const metadata = {
  title: "Converters — DevKit",
  description: "Convert between file formats and encodings. PDF, Image, JSON, CSV, and more.",
};

export default function ConvertersPage() {
  return <ToolHub category={TOOL_CATEGORIES.find((c) => c.id === "converters")!} />;
}
