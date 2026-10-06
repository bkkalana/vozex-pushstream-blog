"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bot,
  Bold,
  Code2,
  Columns3,
  Eraser,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minus,
  Palette,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Table2,
  Trash2,
  UnderlineIcon,
  Undo2,
  YoutubeIcon,
} from "lucide-react";
import { CustomBlock } from "./custom-block";
import { TechnicalCodeBlock } from "./technical-code-block";
import { AiSelectionAssistant } from "@/components/admin/ai/ai-selection-assistant";

type Props = {
  content: unknown;
  onChange: (json: unknown) => void;
  onAutosave?: () => Promise<void>;
  autosaveEnabled?: boolean;
};

type BlockKind = typeof blocks[number]["kind"];

const blocks = [
  { kind: "quick-answer", label: "Quick answer" },
  { kind: "important", label: "Important" },
  { kind: "info", label: "Info" },
  { kind: "tip", label: "Tip" },
  { kind: "warning", label: "Warning" },
  { kind: "pros-cons", label: "Pros / cons" },
  { kind: "affiliate", label: "Affiliate disclosure" },
  { kind: "comparison", label: "Comparison table" },
  { kind: "step", label: "Step" },
  { kind: "cta", label: "CTA" },
  { kind: "newsletter", label: "Newsletter" },
  { kind: "ad", label: "Ad placeholder" },
  { kind: "related", label: "Related post" },
  { kind: "faq", label: "FAQ" },
  { kind: "button", label: "Button" },
] as const;

const colorOptions = [
  { value: "", label: "Default", swatch: "#142447" },
  { value: "#006bdc", label: "Blue", swatch: "#006bdc" },
  { value: "#16a34a", label: "Green", swatch: "#16a34a" },
  { value: "#dc2626", label: "Red", swatch: "#dc2626" },
  { value: "#92400e", label: "Amber", swatch: "#f59e0b" },
] as const;

const highlightOptions = [
  { value: "", label: "No highlight", swatch: "#ffffff" },
  { value: "#fff3bf", label: "Yellow", swatch: "#fff3bf" },
  { value: "#dbeafe", label: "Blue", swatch: "#dbeafe" },
  { value: "#dcfce7", label: "Green", swatch: "#dcfce7" },
  { value: "#fee2e2", label: "Red", swatch: "#fee2e2" },
] as const;

export function ArticleEditor({ content, onChange, onAutosave, autosaveEnabled = false, postId }: Props & { postId?: string }) {
  const [full, setFull] = useState(false);
  const [saveState, setSaveState] = useState("Saved");
  const [changeSeq, setChangeSeq] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selection, setSelection] = useState({ from: 0, to: 0 });
  const dirty = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TechnicalCodeBlock,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write the article here..." }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ allowBase64: false }),
      Youtube.configure({ controls: true }),
      TableKit.configure({ table: { resizable: true } }),
      CustomBlock,
    ],
    content: normalize(content),
    onUpdate: ({ editor }) => {
      dirty.current = true;
      setSaveState("Unsaved");
      setChangeSeq((value) => value + 1);
      onChange(editor.getJSON());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      setSelection({ from, to });
      setSelectedText(from === to ? "" : editor.state.doc.textBetween(from, to, " "));
    },
  });

  useEffect(() => {
    if (!autosaveEnabled || !onAutosave || !dirty.current) return;
    const id = window.setTimeout(async () => {
      if (!dirty.current) return;
      setSaveState("Saving...");
      try {
        await onAutosave();
        dirty.current = false;
        setSaveState("Saved");
      } catch {
        setSaveState("Save failed");
      }
    }, 10000);
    return () => window.clearTimeout(id);
  }, [autosaveEnabled, onAutosave, changeSeq]);

  const activeFormat = useMemo(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("heading", { level: 4 })) return "h4";
    if (editor.isActive("codeBlock")) return "code";
    return "paragraph";
  }, [editor, changeSeq]);

  if (!editor) return <div className="min-h-72 animate-pulse rounded-xl bg-slate-100" />;

  function promptUrl(kind: "link" | "image" | "youtube") {
    const value = window.prompt(`${kind} URL`);
    if (!value) return;
    if (kind === "link") editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
    if (kind === "image") {
      const alt = window.prompt("Image alt text") || "";
      editor.chain().focus().setImage({ src: value, alt }).run();
    }
    if (kind === "youtube") editor.chain().focus().setYoutubeVideo({ src: value }).run();
  }

  function setFormat(value: string) {
    const chain = editor.chain().focus();
    if (value === "paragraph") chain.setParagraph().run();
    if (value === "h2") chain.toggleHeading({ level: 2 }).run();
    if (value === "h3") chain.toggleHeading({ level: 3 }).run();
    if (value === "h4") chain.toggleHeading({ level: 4 }).run();
    if (value === "code") {
      const language = window.prompt("Code language: javascript, typescript, json, bash, sql, php, css, html, python") || "";
      const filename = window.prompt("Optional filename") || "";
      chain.setCodeBlock({ language, filename, lineNumbers: true } as never).run();
    }
  }

  function insertCustomBlock(kind: BlockKind) {
    const item = blocks.find((block) => block.kind === kind);
    if (!item) return;
    if (kind === "step") {
      const stepNumber = window.prompt("Step number") || "";
      const title = window.prompt("Step heading") || item.label;
      const image = window.prompt("Optional image URL") || "";
      const code = window.prompt("Optional code snippet") || "";
      const language = code ? window.prompt("Code language") || "text" : "";
      const filename = code ? window.prompt("Optional code filename") || "" : "";
      editor.chain().focus().insertContent({
        type: "customBlock",
        attrs: { kind, title, stepNumber, image, imageAlt: title, code, language, filename, lineNumbers: Boolean(code) },
        content: [{ type: "paragraph" }],
      }).run();
      return;
    }
    editor.chain().focus().insertContent({ type: "customBlock", attrs: { kind, title: item.label }, content: [{ type: "paragraph" }] }).run();
  }

  return (
    <div className={full ? "fixed inset-0 z-[80] overflow-auto bg-white p-4" : ""}>
      <div className="admin-rich-editor overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
        <div className="admin-rich-editor-toolbar">
          <select aria-label="Text format" value={activeFormat} onChange={(event) => setFormat(event.target.value)} className="admin-rich-editor-select">
            <option value="paragraph">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="code">Code block</option>
          </select>

          <Tool title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></Tool>
          <Tool title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></Tool>
          <Tool title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon /></Tool>
          <Tool title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></Tool>
          <Tool title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code2 /></Tool>

          <span className="admin-rich-editor-separator" />

          <Tool title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft /></Tool>
          <Tool title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter /></Tool>
          <Tool title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight /></Tool>

          <Tool title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></Tool>
          <Tool title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></Tool>
          <Tool title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></Tool>
          <Tool title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></Tool>

          <span className="admin-rich-editor-separator" />

          <Tool title="Link" active={editor.isActive("link")} onClick={() => promptUrl("link")}><Link2 /></Tool>
          <Tool title="Image" onClick={() => promptUrl("image")}><ImageIcon /></Tool>
          <Tool title="YouTube" onClick={() => promptUrl("youtube")}><YoutubeIcon /></Tool>
          <Tool title="Insert table" active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></Tool>
          <Tool title="Add column" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 /></Tool>
          <Tool title="Add row" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 /></Tool>
          <Tool title="Delete table row/column/table" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 /></Tool>

          <span className="admin-rich-editor-separator" />

          <label className="admin-rich-editor-color" title="Text color">
            <Palette aria-hidden="true" size={16} />
            <select aria-label="Text color" onChange={(event) => event.target.value ? editor.chain().focus().setColor(event.target.value).run() : editor.chain().focus().unsetColor().run()}>
              {colorOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="admin-rich-editor-color" title="Highlight">
            <Highlighter aria-hidden="true" size={16} />
            <select aria-label="Highlight" onChange={(event) => event.target.value ? editor.chain().focus().toggleHighlight({ color: event.target.value }).run() : editor.chain().focus().unsetHighlight().run()}>
              {highlightOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <Tool title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser /></Tool>

          <select aria-label="Insert article block" defaultValue="" onChange={(event) => { if (event.target.value) insertCustomBlock(event.target.value as BlockKind); event.target.value = ""; }} className="admin-rich-editor-select">
            <option value="">Insert block</option>
            {blocks.map((block) => <option key={block.kind} value={block.kind}>{block.label}</option>)}
          </select>

          <span className="admin-rich-editor-spacer" />
          <Tool title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 /></Tool>
          <Tool title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 /></Tool>
          <Tool title="AI selection assistant" active={aiOpen} onClick={() => setAiOpen(!aiOpen)}><Bot /></Tool>
          <Tool title="Fullscreen" active={full} onClick={() => setFull(!full)}><Maximize2 /></Tool>
          <span className="admin-rich-editor-state">{saveState}</span>
        </div>

        {aiOpen ? (
          <AiSelectionAssistant
            postId={postId}
            selectedText={selectedText}
            onClose={() => setAiOpen(false)}
            onReplace={(text) => {
              if (selection.from !== selection.to) editor.chain().focus().insertContentAt({ from: selection.from, to: selection.to }, text).run();
            }}
            onInsert={(text) => editor.chain().focus().insertContentAt(selection.to, ` ${text}`).run()}
          />
        ) : null}

        <EditorContent editor={editor} className="article-editor admin-rich-editor-content min-h-[600px] px-5 py-4" />
      </div>
    </div>
  );
}

function Tool({ children, title, onClick, active = false, disabled = false }: { children: React.ReactNode; title: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      className="admin-rich-editor-button"
      data-active={active ? "true" : "false"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function normalize(value: unknown) {
  if (value && typeof value === "object" && "type" in (value as Record<string, unknown>)) return value;
  return { type: "doc", content: [{ type: "paragraph" }] };
}
