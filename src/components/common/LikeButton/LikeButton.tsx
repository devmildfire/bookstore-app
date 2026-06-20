'use client'

import cn from 'classnames'
import { useLikedIds, useToggleLike } from '@/hooks/useLikes'
import type { LikeItemType } from '@/api/likes/types'
import styles from './LikeButton.module.scss'

type Props = {
  type: LikeItemType
  itemId: number
  className?: string
  // Pixel size of the heart icon. The button hit-target adds padding.
  size?: number
}

export default function LikeButton({ type, itemId, className, size = 22 }: Props) {
  const { data: likedIds } = useLikedIds(type)
  const { mutate, isPending } = useToggleLike(type)
  const liked = likedIds?.has(itemId) ?? false

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    mutate(itemId)
  }

  return (
    <button
      type='button'
      className={cn(styles.btn, liked && styles.btnLiked, className)}
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? 'Убрать из избранного' : 'Добавить в избранное'}
      aria-pressed={liked}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill={liked ? 'currentColor' : 'none'}
        stroke='currentColor'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden
      >
        <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
      </svg>
    </button>
  )
}
