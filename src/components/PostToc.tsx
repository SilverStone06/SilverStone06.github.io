// src/components/Post/PostToc.tsx
import React from 'react'

export type TocItem = {
  id: string
  text: string
  indentLevel?: number
}

type TocProps = {
  toc: TocItem[]
}

const PostToc: React.FC<TocProps> = ({ toc }) => {
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault()

    const target = document.getElementById(id)
    if (!target) return

    const headerOffset = 80 // 상단 고정 네비 높이만큼 보정 (필요 없으면 0)
    const y =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerOffset

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    })

    // 주소창 해시만 살짝 바꿔주기 (새로고침 대비용)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav className="post-toc">
      <ul className="flex flex-col gap-1">
        {toc.map((item) => (
          <li
            key={item.id}
            className={item.indentLevel ? `pl-${item.indentLevel * 4}` : ''}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className="text-sm hover:underline cursor-pointer"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default PostToc
