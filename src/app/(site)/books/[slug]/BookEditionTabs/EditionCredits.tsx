'use client'

import { useState } from 'react'
import cn from 'classnames'
import type { BookWorker } from '@/entities/book/client'
import styles from './BookEditionTabs.module.scss'

// «Над изданием работали» — collapsed by default, expands to a full-width,
// role-grouped, multi-column block where each person is a vertical
// firstname / surname stack (one word per column).
function pluralPeople(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'человек'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'человека'
  return 'человек'
}

type RoleGroup = { role: string; people: BookWorker[] }

function groupByRole(workers: BookWorker[]): RoleGroup[] {
  const groups: RoleGroup[] = []
  const byRole = new Map<string, RoleGroup>()
  for (const w of workers) {
    let g = byRole.get(w.job)
    if (!g) {
      g = { role: w.job, people: [] }
      byRole.set(w.job, g)
      groups.push(g)
    }
    g.people.push(w)
  }
  return groups
}

export default function EditionCredits({ workers }: { workers: BookWorker[] }) {
  const [open, setOpen] = useState(false)
  if (workers.length === 0) return null

  const groups = groupByRole(workers)
  const total = workers.length

  return (
    <div className={cn(styles.credits, open && styles.creditsOpen)}>
      <button
        type='button'
        className={styles.creditsToggle}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.creditsHeading}>Над изданием работали</span>
        <span className={styles.creditsCount}>
          {total} {pluralPeople(total)}
        </span>
        <span className={styles.creditsChevron} aria-hidden='true' />
      </button>

      {open && (
        <div className={styles.creditsRoles}>
          {groups.map((g) => (
            <div key={g.role} className={styles.creditsRole}>
              <div className={styles.creditsRoleName}>{g.role}</div>
              <div className={styles.creditsPeople}>
                {g.people.map((p, j) => {
                  const [first, ...rest] = p.name.split(/\s+/)
                  return (
                    <div key={`${p.name}-${j}`} className={styles.creditsPerson}>
                      <span className={styles.creditsFn}>{first}</span>
                      {rest.length > 0 && <span className={styles.creditsLn}>{rest.join(' ')}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
