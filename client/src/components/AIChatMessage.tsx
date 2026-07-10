/** Lightweight markdown-to-HTML renderer — handles the formats the LLM commonly outputs. */
function renderMarkdown(text: string): string {
  let html = text;

  // Escape HTML first, then selectively unescape our own injected tags
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers (##, ###, etc) — must run before bold (**)
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic *text* (but not inside words like markdown*it)
  html = html.replace(
    /(^|\s)\*([^*\n]+)\*(\s|$|[.,;:!?)])/g,
    "$1<em>$2</em>$3",
  );

  // Inline code `text`
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // Horizontal rules
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, "<hr>");

  // Unordered lists (- item or * item)
  html = html.replace(/^(\s*)[-*] (.+)$/gm, "$1<li>$2</li>");

  // Ordered lists (1. item)
  html = html.replace(/^(\s*)\d+\. (.+)$/gm, "$1<li>$2</li>");

  // Wrap consecutive <li> in <ul>/<ol>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Blockquotes (> text)
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  // Tables — must run BEFORE paragraph wrapping, on raw pipe lines
  html = renderTables(html);

  // Paragraphs: double newlines → </p><p>
  html = html.replace(/\n\n+/g, "</p><p>");
  html = "<p>" + html + "</p>";

  // Clean up empty paragraphs and paragraphs wrapping block elements
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(
    /<p>(<(?:h[1-4]|ul|ol|table|hr|blockquote|pre|div))/g,
    "$1",
  );
  html = html.replace(
    /(<\/(?:h[1-4]|ul|ol|table|blockquote|pre|div)>)<\/p>/g,
    "$1",
  );

  // Line breaks (single newline = <br>)
  html = html.replace(/\n/g, "<br>");

  // Remove <br> sitting between HTML tags (they add unwanted double-spacing)
  html = html.replace(/>(<br>)+</g, "><");

  // Cleanup: remove empty <p><br></p> sequences
  html = html.replace(/<p><br><\/p>/g, "");

  return html;
}

function renderTables(html: string): string {
  // Match raw pipe-delimited lines before paragraph wrapping
  const tableRegex = /((?:^\|.+\|[\t ]*\n?)+)/gm;
  return html.replace(tableRegex, (match) => {
    const rows = match
      .trim()
      .split("\n")
      .filter((r) => r.trim());
    if (rows.length < 2) return match;

    // Skip separator row (|---|---|)
    const dataRows = rows.filter((r) => !/^\|[\s\-:|]+\|$/.test(r));
    if (dataRows.length === 0) return match;

    const headerCells = dataRows[0]
      .split("|")
      .filter((c) => c.trim())
      .map((c) => `<th>${c.trim()}</th>`)
      .join("");

    const bodyRows = dataRows
      .slice(1)
      .map(
        (row) =>
          `<tr>${row
            .split("|")
            .filter((c) => c.trim())
            .map((c) => `<td>${c.trim()}</td>`)
            .join("")}</tr>`,
      )
      .join("");

    return `<div class="overflow-x-auto"><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
  });
}

const SPARKLES_SVG = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

/** Tailwind prose overrides scoped to the chat bubble — keeps markdown clean without a full typography plugin. */
const PROSE_CLASSES = [
  "[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-0.5",
  "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-0.5",
  "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-1.5 [&_h3]:mb-0.5",
  "[&_p]:mb-1 [&_p:last-child]:mb-0",
  "[&_ul]:mb-1 [&_ul]:list-disc [&_ul]:pl-4",
  "[&_ol]:mb-1 [&_ol]:list-decimal [&_ol]:pl-4",
  "[&_li]:mb-0",
  "[&_strong]:font-semibold",
  "[&_code]:rounded [&_code]:bg-theme-200/60 [&_code]:px-1 [&_code]:text-xs",
  "[&_pre]:mb-1 [&_pre]:overflow-x-auto [&_pre]:rounded-sm [&_pre]:bg-theme-800 [&_pre]:p-3 [&_pre]:text-xs [&_pre]:text-theme-100",
  "[&_table]:mb-1 [&_table]:w-full [&_table]:text-xs [&_table]:table-auto [&_table]:font-martian-mono",
  "[&_th]:border [&_th]:border-theme-300 [&_th]:bg-theme-200/50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold [&_th]:whitespace-nowrap [&_th]:font-martian-mono",
  "[&_td]:border [&_td]:border-theme-200 [&_td]:px-2 [&_td]:py-1 [&_td]:max-w-[200px] [&_td]:font-martian-mono",
  "[&_blockquote]:border-theme-400 [&_blockquote]:mb-1 [&_blockquote]:border-l-3 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-theme-600",
  "[&_hr]:border-theme-200 [&_hr]:my-2",
  "[&_a]:text-theme-600 [&_a]:underline",
].join(" ");

interface AIChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming: boolean;
}

export default function AIChatMessage({
  role,
  content,
  isStreaming,
}: AIChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      class={`animate-fade-in-up animate-duration-300 flex motion-reduce:animate-none ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        class={`flex max-w-[80%] items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* AI avatar — only for assistant messages */}
        {!isUser && (
          <div class="text-theme-400 mt-1 shrink-0">{SPARKLES_SVG}</div>
        )}

        <div
          class={`rounded-sm px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? "bg-theme-400 font-martian-mono text-white"
              : `bg-theme-100 text-theme-800 ${PROSE_CLASSES}`
          }`}
        >
          {isUser ? (
            <span>{content}</span>
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html:
                  renderMarkdown(content) +
                  (isStreaming
                    ? '<span class="bg-theme-400 ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm"></span>'
                    : ""),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
