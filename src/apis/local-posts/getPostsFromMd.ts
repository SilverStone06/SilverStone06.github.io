// src/apis/local-posts/getPostsFromMd.ts
// @ts-nocheck

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { TPosts } from "src/types"
import { CONFIG } from "site.config"

const POSTS_DIR = path.join(process.cwd(), "src", "posts")

/**
 * md 파일 기반 getPosts
 * - src/posts/*.md 를 읽어서
 * - frontmatter를 TPost 모양에 최대한 그대로 매핑해서 돌려줌
 */
export const getPostsFromMd = async (): Promise<TPosts> => {
  // src/posts 안에 있는 .md 파일 목록
  const files = fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".md"))
    .map((f) => f.name)

  const data = files.map((filename) => {
    const slugFromFile = filename.replace(/\.md$/, "")
    const fullPath = path.join(POSTS_DIR, filename)
    const raw = fs.readFileSync(fullPath, "utf8")

    const { data: fm, content } = matter(raw)

    // frontmatter에 slug가 있다면 그걸 우선, 없으면 파일명 기반
    const slug = fm.slug ?? slugFromFile

    // author가 문자열 또는 문자열 배열로 되어 있을 수 있어서 통일
   const rawAuthor = fm.author

  let author: any[] = []

  if (Array.isArray(rawAuthor)) {
    author = rawAuthor.map((a) =>
      typeof a === "string"
        ? { name: a, profile_photo: CONFIG.profile.image }
        : a
    )
  } else if (rawAuthor) {
    author = [
      typeof rawAuthor === "string"
        ? { name: rawAuthor, profile_photo: CONFIG.profile.image }
        : rawAuthor,
    ]
  }

    // 기존 TPost 구조를 최대한 그대로 맞춰줌
    const post: any = {
      ...fm,
      slug,
      // createdTime / date가 비어있으면 기본값 세팅
      createdTime:
        fm.createdTime ??
        fm.date?.start_date ??
        fm.date ??
        new Date().toISOString(),
      // status / type은 기존 코드에서 배열로 쓰니까 형태 맞춰줌
      status: Array.isArray(fm.status) ? fm.status : [fm.status ?? "Public"],
      type: Array.isArray(fm.type) ? fm.type : [fm.type ?? "Post"],
      tags: fm.tags ?? [],
      category: fm.category ?? [],
      summary: fm.summary ?? "",
      thumbnail: fm.thumbnail ?? null,
      author,
      // 나중에 md 본문을 Detail에서 쓰고 싶으면 여기 content도 같이 넘길 수 있음
      content,
    }

    return post
  })

  // 기존 getPosts 처럼 날짜 기준 최신순 정렬
  data.sort((a, b) => {
    const dateA: any = new Date(a?.date?.start_date || a.createdTime)
    const dateB: any = new Date(b?.date?.start_date || b.createdTime)
    return dateB - dateA
  })

  return data as TPosts
}
