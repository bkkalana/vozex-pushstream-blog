import { Fragment } from "react";
import type { CSSProperties } from "react";
import { Lightbulb, ShieldAlert, Sparkles } from "lucide-react";
import { SharedContentBlock } from "@/components/site/shared-content-block";
import { TechnicalCodeBlock } from "@/components/site/article/technical-code-block";
import { extractToc, plainText, slugifyHeading } from "@/services/site/toc";

/* eslint-disable @next/next/no-img-element */

type N = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: N[];
};

export function ArticleJsonRenderer({ doc }: { doc: unknown }) {
  const toc = extractToc(doc);
  let headingIndex = 0;
  return <div className="article-prose ps-article-prose">{renderNodes((doc as N)?.content || [], () => toc[headingIndex++]?.id)}</div>;
}

function renderNodes(nodes: N[], nextHeadingId: () => string | undefined): React.ReactNode {
  return nodes.map((node, index) => {
    const children = node.text ? marks(node, node.text) : renderNodes(node.content || [], nextHeadingId);
    switch (node.type) {
      case "text": return <Fragment key={index}>{children}</Fragment>;
      case "paragraph": return <p key={index} style={textAlignStyle(node)}>{children}</p>;
      case "heading": {
        const level = Number(node.attrs?.level || 2);
        const id = (level === 2 || level === 3 ? nextHeadingId() : undefined) || slugifyHeading(plainText(node));
        if (level === 3) return <h3 id={id} key={index} className="scroll-mt-24" style={textAlignStyle(node)}>{children}</h3>;
        if (level === 4) return <h4 id={id} key={index} className="scroll-mt-24" style={textAlignStyle(node)}>{children}</h4>;
        return <h2 id={id} key={index} className="scroll-mt-24" style={textAlignStyle(node)}>{children}</h2>;
      }
      case "bulletList": return <ul key={index}>{children}</ul>;
      case "orderedList": return <ol key={index}>{children}</ol>;
      case "listItem": return <li key={index}>{children}</li>;
      case "blockquote": return <blockquote key={index}>{children}</blockquote>;
      case "codeBlock": return <TechnicalCodeBlock key={index} code={plainText(node)} language={String(node.attrs?.language || "")} filename={String(node.attrs?.filename || "")} lineNumbers={Boolean(node.attrs?.lineNumbers)} />;
      case "image": {
        const src = safeSrc(String(node.attrs?.src || ""));
        if (!src) return null;
        const caption = String(node.attrs?.caption || "").trim();
        return <figure key={index} className="ps-article-figure">
          <img src={src} alt={String(node.attrs?.alt || "")} loading="lazy" />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>;
      }
      case "table": return <div key={index} className="ps-article-table-wrap" tabIndex={0} role="region" aria-label="Scrollable article table"><table><tbody>{children}</tbody></table></div>;
      case "tableRow": return <tr key={index}>{children}</tr>;
      case "tableHeader": return <th key={index}>{children}</th>;
      case "tableCell": return <td key={index}>{children}</td>;
      case "sharedContentBlock": return <SharedContentBlock key={index} slug={String(node.attrs?.slug || "")} />;
      case "customBlock": {
        const kind = String(node.attrs?.kind || "info").toLowerCase();
        if (kind === "step") {
          const stepImage = safeSrc(String(node.attrs?.image || ""));
          return <section key={index} className="ps-article-step">
            <div className="ps-article-step-number">{String(node.attrs?.stepNumber || index + 1)}</div>
            <div className="min-w-0 flex-1">
              <p className="ps-article-step-label">Step {String(node.attrs?.stepNumber || index + 1)}</p>
              <h3>{String(node.attrs?.title || "Tutorial step")}</h3>
              <div className="ps-article-step-content">{children}</div>
              {stepImage ? <img className="ps-article-step-image" src={stepImage} alt={String(node.attrs?.imageAlt || node.attrs?.title || "Tutorial step image")} loading="lazy" /> : null}
              {node.attrs?.code ? <div className="mt-5"><TechnicalCodeBlock code={String(node.attrs.code)} language={String(node.attrs?.language || "")} filename={String(node.attrs?.filename || "")} lineNumbers={Boolean(node.attrs?.lineNumbers)} /></div> : null}
            </div>
          </section>;
        }
        const warning = kind === "warning";
        const tip = kind === "tip" || kind === "protip" || kind === "pro-tip";
        const Icon = warning ? ShieldAlert : tip ? Sparkles : Lightbulb;
        return <aside key={index} className={`ps-article-callout ${warning ? "ps-article-callout-warning" : tip ? "ps-article-callout-tip" : "ps-article-callout-info"}`}>
          <span className="ps-article-callout-icon"><Icon size={19} aria-hidden="true" /></span>
          <div><strong>{String(node.attrs?.title || (warning ? "Important" : tip ? "Pro tip" : "Good to know"))}</strong><div>{children}</div></div>
        </aside>;
      }
      case "horizontalRule": return <hr key={index} />;
      case "hardBreak": return <br key={index} />;
      default: return <Fragment key={index}>{children}</Fragment>;
    }
  });
}

function marks(node: N, text: string) {
  let output: React.ReactNode = text;
  for (const mark of node.marks || []) {
    if (mark.type === "bold") output = <strong>{output}</strong>;
    if (mark.type === "italic") output = <em>{output}</em>;
    if (mark.type === "underline") output = <u>{output}</u>;
    if (mark.type === "strike") output = <s>{output}</s>;
    if (mark.type === "code") output = <code>{output}</code>;
    if (mark.type === "highlight") output = <mark style={markStyle(mark, "backgroundColor")}>{output}</mark>;
    if (mark.type === "textStyle") output = <span style={markStyle(mark, "color")}>{output}</span>;
    if (mark.type === "link") {
      const href = safeHref(String(mark.attrs?.href || ""));
      output = href ? <a href={href} rel="noopener noreferrer">{output}</a> : output;
    }
  }
  return output;
}

function textAlignStyle(node: N): CSSProperties | undefined {
  const textAlign = String(node.attrs?.textAlign || "");
  return ["left", "center", "right", "justify"].includes(textAlign) ? { textAlign: textAlign as CSSProperties["textAlign"] } : undefined;
}

function markStyle(mark: { attrs?: Record<string, unknown> }, property: "color" | "backgroundColor"): CSSProperties | undefined {
  const value = property === "color" ? mark.attrs?.color : mark.attrs?.color;
  return typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value) ? { [property]: value } : undefined;
}

function safeHref(value: string) {
  if (value.startsWith("#") || value.startsWith("/") || /^https?:\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:/i.test(value)) return value;
  return "";
}

function safeSrc(value: string) {
  if (value.startsWith("/uploads/") || /^https?:\/\//i.test(value)) return value;
  return "";
}
