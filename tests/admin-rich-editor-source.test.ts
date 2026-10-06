import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("admin rich text editor", () => {
  it("uses Tiptap extensions for a full writing toolbar instead of the old blank custom button strip", () => {
    const editor = read("components/admin/editor/article-editor.tsx");
    expect(editor).toContain("@tiptap/extension-text-align");
    expect(editor).toContain("@tiptap/extension-highlight");
    expect(editor).toContain("@tiptap/extension-color");
    expect(editor).toContain("admin-rich-editor-toolbar");
    expect(editor).toContain("Insert block");
    expect(editor).not.toContain('className="flex flex-wrap gap-2 border-b p-2"');
  });

  it("renders rich editor marks and alignment on public articles", () => {
    const renderer = read("components/site/article-json-renderer.tsx");
    expect(renderer).toContain("textAlignStyle");
    expect(renderer).toContain('mark.type === "highlight"');
    expect(renderer).toContain('mark.type === "textStyle"');
    expect(renderer).toContain('mark.type === "strike"');
  });
});
