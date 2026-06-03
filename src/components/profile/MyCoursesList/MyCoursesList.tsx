'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getOrders, ordersQueryKey } from '@/api/orders'
import { itemLink } from '@/lib/orderDisplay'
import type { OrderItem } from '@/entities/order/client'
import styles from './MyCoursesList.module.scss'

// Every course the user owns, pulled from their paid orders and de-duplicated
// by product. Course content lives on the course's own page — the card links
// there. (In-app course playback is out of scope; see AGENTS.md § Checkout.)
export default function MyCoursesList() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  })

  if (isLoading) return <p className={styles.empty}>Загрузка…</p>

  const byBookId = new Map<string, OrderItem>()
  for (const order of orders) {
    for (const item of order.items) {
      if (item.category === 'Course' && !byBookId.has(item.bookId)) {
        byBookId.set(item.bookId, item)
      }
    }
  }
  const courses = Array.from(byBookId.values())

  if (courses.length === 0) return <p className={styles.empty}>Пока ничего нет</p>

  return (
    <div className={styles.grid}>
      {courses.map((item) => (
        <CourseCard key={item.bookId} item={item} />
      ))}
    </div>
  )
}

function CourseCard({ item }: { item: OrderItem }) {
  const href = itemLink(item)

  const cover = (
    <div className={styles.cover}>
      {item.coverUrl ? (
        <Image
          src={item.coverUrl}
          alt={`Курс: ${item.name}`}
          fill
          sizes='(max-width: 532px) 90vw, 320px'
          className={styles.coverImg}
          unoptimized
        />
      ) : (
        <div className={styles.coverPlaceholder} aria-hidden />
      )}
    </div>
  )

  return (
    <div className={styles.card}>
      {href ? (
        <Link href={href} className={styles.coverLink} aria-label={item.name}>
          {cover}
        </Link>
      ) : (
        cover
      )}

      <div className={styles.body}>
        <span className={styles.name}>{item.name}</span>
        {href ? (
          <Link href={href} className={styles.action}>
            Открыть курс
          </Link>
        ) : (
          <span className={styles.owned}>В вашей коллекции</span>
        )}
      </div>
    </div>
  )
}
