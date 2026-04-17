import { diffLines, type Change } from "diff";

export type DiffRow = {
  type: "removed" | "added" | "unchanged";
  origLine: number | null;
  modLine: number | null;
  text: string;
};

export function computeDiff(original: string, modified: string): DiffRow[] {
  const changes: Change[] = diffLines(original, modified, { newlineIsToken: false });
  const rows: DiffRow[] = [];
  let orig = 1;
  let mod = 1;

  for (const change of changes) {
    const lines = change.value.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();

    for (const text of lines) {
      if (change.removed) {
        rows.push({ type: "removed", origLine: orig++, modLine: null, text });
      } else if (change.added) {
        rows.push({ type: "added", origLine: null, modLine: mod++, text });
      } else {
        rows.push({ type: "unchanged", origLine: orig++, modLine: mod++, text });
      }
    }
  }
  return rows;
}
