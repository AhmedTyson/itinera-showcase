import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeRaw from "rehype-raw"
import { useScrollTo } from "../../hooks/useScrollTo"
import { CodeBlock } from "../ui/code-block"
import { MermaidDiagram } from "./mermaid-diagram"

type Props = { content: string }

function extractText(children: React.ReactNode): string {
  let out = ""
  React.Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") out += String(child)
    else if (React.isValidElement(child)) out += extractText((child.props as { children?: React.ReactNode }).children)
  })
  return out
}

/** react-markdown pipeline into design-system components. Memoized — parsing is expensive. */
export const MarkdownReader = React.memo(function MarkdownReader({ content }: Props) {
  const scrollTo = useScrollTo()
  // stable per-content handlers
  const components = useMemo(
    () => ({
      h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
        <h1 className="mb-4 mt-2 scroll-mt-24 text-3xl font-bold tracking-tight text-text" {...props} />
      ),
      h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
        <h2
          className="group mb-3 mt-10 scroll-mt-24 text-xl font-bold tracking-tight text-text md:text-2xl"
          {...props}
        >
          {props.children}
          <a
            href={`#${props.id}`}
            aria-label={`Link to ${extractText(props.children)}`}
            onClick={(e) => {
              e.preventDefault()
              scrollTo(`#${props.id}`)
            }}
            className="ml-2 select-none text-sm text-dim opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 focus-visible:opacity-100"
          >
            #
          </a>
        </h2>
      ),
      h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
        <h3 className="mb-2 mt-8 scroll-mt-24 text-base font-semibold text-text" {...props} />
      ),
      h4: (props: React.ComponentPropsWithoutRef<"h4">) => (
        <h4 className="mb-2 mt-6 text-[15px] font-semibold text-text" {...props} />
      ),
      p: (props: React.ComponentPropsWithoutRef<"p">) => (
        <p className="my-3 max-w-[72ch] text-[14px] leading-relaxed text-muted" {...props} />
      ),
      ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
        <ul className="my-3 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted marker:text-dim" {...props} />
      ),
      ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
        <ol className="my-3 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted marker:text-dim" {...props} />
      ),
      li: (props: React.ComponentPropsWithoutRef<"li">) => <li {...props} />,
      strong: (props: React.ComponentPropsWithoutRef<"strong">) => <strong className="font-semibold text-text" {...props} />,
      a: (({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        const internal = href?.startsWith("#")
        if (internal) {
          return (
            <a
              href={href}
              onClick={(e) => {
                e.preventDefault()
                scrollTo(href!)
              }}
              className="text-primary underline-offset-4 hover:underline"
              {...props}
            >
              {children}
            </a>
          )
        }
        return (
          <a href={href} target="_blank" rel="noreferrer" className="break-all text-primary underline-offset-4 hover:underline" {...props}>
            {children}
          </a>
        )
      }) as unknown as React.FC<React.ComponentPropsWithoutRef<"a">>,
      blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
        <blockquote
          className="my-4 border-l-2 border-primary/50 bg-primary/5 py-2 pl-4 pr-3 text-[13.5px] italic leading-relaxed text-muted [&>p]:my-1"
          {...props}
        />
      ),
      table: (({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div
          tabIndex={0}
          role="region"
          aria-label="Data table — scrollable horizontally on small screens"
          className="my-4 overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <table className="w-full min-w-[520px] border-collapse text-[13.5px]" {...props}>
            {children}
          </table>
        </div>
      )) as unknown as React.FC<React.ComponentPropsWithoutRef<"table">>,
      thead: (props: React.ComponentPropsWithoutRef<"thead">) => <thead className="bg-white/5 text-left" {...props} />,
      th: (props: React.ComponentPropsWithoutRef<"th">) => (
        <th scope="col" className="border-b border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-dim" {...props} />
      ),
      td: (props: React.ComponentPropsWithoutRef<"td">) => <td className="border-b border-border/60 px-3 py-2 align-top text-muted" {...props} />,
      tr: (props: React.ComponentPropsWithoutRef<"tr">) => <tr className="hover:bg-white/[0.02]" {...props} />,
      code: (({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
        const match = /language-(\w+)/.exec(className || "")
        const raw = extractText(children).replace(/\n$/, "")
        if (match?.[1] === "mermaid") return <MermaidDiagram chart={raw} />
        // inline code (no language + no newlines) stays inline
        if (!className && !raw.includes("\n")) {
          return (
            <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[12px] text-text" {...props}>
              {children}
            </code>
          )
        }
        return (
          <CodeBlock code={raw} label={match?.[1]} className="my-3" />
        )
      }) as unknown as React.FC<React.ComponentPropsWithoutRef<"code">>,
      pre: ({ children }: React.ComponentPropsWithoutRef<"pre">) => <>{children}</>,
      hr: () => <hr className="my-6 border-border/60" />,
    }),
    [scrollTo]
  )

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeRaw]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
})
