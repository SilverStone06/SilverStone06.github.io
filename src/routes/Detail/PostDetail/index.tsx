import React, { useMemo, useRef } from "react"
import styled from "@emotion/styled"

import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import usePostQuery from "src/hooks/usePostQuery"
import useScroll from "src/hooks/useScroll"
import ReadingProgressBar from "src/components/ReadingProgressBar"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import Image from "next/image"

type TocItem = {
  id: string
  indentLevel: number
  text: string
}

// 간단한 slug 생성기 (제목 → id)
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")

// Markdown 본문에서 ##, ### 헤딩만 뽑아서 TOC로 사용
const buildTocFromMarkdown = (content: string): TocItem[] => {
  const lines = content.split("\n")
  const toc: TocItem[] = []

  for (const line of lines) {
    const h2Match = /^##\s+(.+)$/.exec(line)
    const h3Match = /^###\s+(.+)$/.exec(line)

    if (h2Match) {
      const text = h2Match[1].trim()
      toc.push({
        id: slugify(text),
        text,
        indentLevel: 0,
      })
    } else if (h3Match) {
      const text = h3Match[1].trim()
      toc.push({
        id: slugify(text),
        text,
        indentLevel: 1,
      })
    }
  }

  return toc
}

function scrollToHeading(id: string) {
  if (typeof document === "undefined" || typeof window === "undefined") return
  if (!id) return

  const target = document.getElementById(id)
  if (!target) return

  const headerOffset = 80
  const rect = target.getBoundingClientRect()
  const scrollTop = window.scrollY || window.pageYOffset
  const targetY = rect.top + scrollTop - headerOffset

  window.scrollTo({
    top: targetY,
    behavior: "smooth",
  })

  history.replaceState(null, "", `#${id}`)
}

const PostDetail: React.FC = () => {
  const data = usePostQuery()
  const articleRef = useRef<HTMLDivElement | null>(null)
  const progress = useScroll(articleRef)

  const content = (data as any)?.content || "" // getPostsFromMd에서 넣어준 md 본문

  // Markdown 기반 TOC 생성 (Hook은 항상 같은 순서로 호출되어야 하므로 early return 전에 호출)
  const toc: TocItem[] = useMemo(() => {
    if (!content) return []
    return buildTocFromMarkdown(content)
  }, [content])

  if (!data) return null

  const topTocItems = toc.filter((item) => item.indentLevel <= 0)
  const category = data.category?.[0]

  return (
    <>
      <ReadingProgressBar progress={progress} />

      <StyledWrapper>
        <article>
          {category && (
            <div css={{ marginBottom: "0.5rem" }}>
              <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
                {category}
              </Category>
            </div>
          )}

          {data.type[0] === "Post" && <PostHeader data={data} />}

          {topTocItems.length > 0 && (
            <StyledTopToc>
              {topTocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToHeading(item.id)
                  }}
                >
                  {item.text}
                </a>
              ))}
            </StyledTopToc>
          )}

          <div ref={articleRef}>
            {/* 🔥 여기서 md 본문 렌더링 */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ node, ...props }) => {
                  const text = String(props.children ?? "")
                  const id = slugify(text)
                  return <h1 id={id} {...props} />
                },
                h2: ({ node, ...props }) => {
                  const text = String(props.children ?? "")
                  const id = slugify(text)
                  return <h2 id={id} {...props} />
                },
                h3: ({ node, ...props }) => {
                  const text = String(props.children ?? "")
                  const id = slugify(text)
                  return <h3 id={id} {...props} />
                },
                img: ({ node, ...props }) => {
                  // 이미지 경로가 /images/posts/로 시작하는 경우 Next.js Image 컴포넌트 사용
                  const src = props.src || ""
                  if (src.startsWith("/images/")) {
                    return (
                      <Image
                        src={src}
                        alt={props.alt || ""}
                        width={800}
                        height={600}
                        style={{ width: "100%", height: "auto" }}
                        unoptimized
                      />
                    )
                  }
                  // 외부 이미지나 다른 경로는 일반 img 태그 사용
                  return <img {...props} style={{ maxWidth: "100%", height: "auto" }} />
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {data.type[0] === "Post" && (
            <>
              <Footer />
              <CommentBox data={data} />
            </>
          )}
        </article>
      </StyledWrapper>

      {toc.length > 0 && (
        <StyledRightToc>
          <div className="toc-title">목차</div>
          <ul>
            {toc.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: `${item.indentLevel * 0.75}rem` }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToHeading(item.id)
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </StyledRightToc>
      )}
    </>
  )
}

export default PostDetail

const StyledWrapper = styled.div`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  border-radius: 1.5rem;
  max-width: 56rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;

  > article {
    margin: 0 auto;
    max-width: 42rem;
  }

  /* 예전 Notion callout/quote 스타일은 남겨둬도 문제 없음.
     추후 정리 예정 */
  .notion-callout *,
  .notion-quote * {
    font-size: 0.9rem !important;
    line-height: 1.55 !important;
  }

  .notion-hr {
    border: none;
    border-top: 2px solid
      ${({ theme }) =>
        theme.scheme === "light"
          ? "rgba(148, 163, 184, 0.7)"
          : "rgba(148, 163, 184, 0.4)"};
    margin: 1.75rem 0;
  }
`

const StyledTopToc = styled.nav`
  margin: 1.5rem 0 2rem;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(148, 163, 184, 0.4);
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.875rem;

  a {
    color: rgba(100, 116, 139, 1);
    text-decoration: none;
    padding: 0.15rem 0.25rem;
    border-radius: 0.375rem;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: rgba(248, 250, 252, 1);
      color: rgba(15, 23, 42, 1);
    }
  }
`

const StyledRightToc = styled.nav`
  position: fixed;
  top: 6rem;
  right: 3rem;
  max-width: 220px;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: rgba(100, 116, 139, 1);
  padding: 0.75rem 0.75rem 0.75rem 0.5rem;
  border-radius: 0.75rem;
  background-color: rgba(15, 23, 42, 0.02);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.4);

  .toc-title {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: rgba(51, 65, 85, 1);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 60vh;
    overflow-y: auto;
  }

  li + li {
    margin-top: 0.25rem;
  }

  a {
    text-decoration: none;
    color: inherit;
    display: inline-block;
    padding: 0.125rem 0.25rem;
    border-radius: 0.375rem;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: rgba(248, 250, 252, 1);
      color: rgba(15, 23, 42, 1);
    }
  }

  @media (max-width: 900px) {
    display: none;
  }
`
