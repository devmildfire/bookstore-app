'use client'

import { useState, useRef, useEffect } from 'react'
import cn from 'classnames'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/admin/icons'
import styles from './AdminDatePicker.module.scss'

// Custom date picker (Radix ships no calendar primitive). Built on the same
// open/outside-click/Escape pattern as AdminSelect, styled like AdminInput.
// Stores/submits an ISO `YYYY-MM-DD` string via a hidden input, so it drops into
// plain forms over a text column. A years view allows fast jumps for historical
// dates; the value can be cleared (for optional dates like death date).

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function parseISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}
function formatDisplay(s: string): string {
  const d = parseISO(s)
  return d ? `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}` : ''
}

type Props = {
  name: string
  defaultValue?: string
  ariaLabel?: string
  placeholder?: string
}

export default function AdminDatePicker({ name, defaultValue = '', ariaLabel, placeholder = 'дд.мм.гггг' }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'days' | 'years'>('days')
  const start = parseISO(defaultValue) ?? new Date()
  const [cursor, setCursor] = useState(() => new Date(start.getFullYear(), start.getMonth(), 1))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = parseISO(value)
  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  // Day grid: 6 weeks, Monday-first.
  const firstDay = new Date(year, month, 1)
  const offset = (firstDay.getDay() + 6) % 7 // 0 = Monday
  const gridStart = new Date(year, month, 1 - offset)
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })

  function pick(d: Date) {
    setValue(toISO(d))
    setOpen(false)
    setView('days')
  }

  // Years view: 12-year grid around the cursor year.
  const decadeStart = year - (((year % 12) + 12) % 12)
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i)

  return (
    <div className={cn(styles.picker, open && styles.open)} ref={ref}>
      <input type='hidden' name={name} value={value} />
      <button
        type='button'
        className={styles.trigger}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn(styles.value, !value && styles.placeholder)}>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarIcon className={styles.icon} />
      </button>

      {open && (
        <div className={styles.popover} role='dialog'>
          {view === 'days' ? (
            <>
              <div className={styles.head}>
                <button type='button' className={styles.nav} aria-label='Предыдущий месяц' onClick={() => setCursor(new Date(year, month - 1, 1))}>
                  <ChevronLeftIcon />
                </button>
                <button type='button' className={styles.title} onClick={() => setView('years')}>
                  {MONTHS[month]} {year}
                </button>
                <button type='button' className={styles.nav} aria-label='Следующий месяц' onClick={() => setCursor(new Date(year, month + 1, 1))}>
                  <ChevronRightIcon />
                </button>
              </div>
              <div className={styles.weekdays}>
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className={styles.grid}>
                {days.map((d) => {
                  const outside = d.getMonth() !== month
                  const isSel = selected != null && toISO(d) === toISO(selected)
                  return (
                    <button
                      type='button'
                      key={toISO(d)}
                      className={cn(styles.day, outside && styles.outside, isSel && styles.selected)}
                      onClick={() => pick(d)}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
              <div className={styles.foot}>
                <button type='button' className={styles.footBtn} onClick={() => pick(new Date())}>
                  Сегодня
                </button>
                {value && (
                  <button
                    type='button'
                    className={styles.footBtn}
                    onClick={() => {
                      setValue('')
                      setOpen(false)
                    }}
                  >
                    Очистить
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={styles.head}>
                <button type='button' className={styles.nav} aria-label='Назад' onClick={() => setCursor(new Date(decadeStart - 12, month, 1))}>
                  <ChevronLeftIcon />
                </button>
                <span className={styles.title}>
                  {decadeStart}–{decadeStart + 11}
                </span>
                <button type='button' className={styles.nav} aria-label='Вперёд' onClick={() => setCursor(new Date(decadeStart + 12, month, 1))}>
                  <ChevronRightIcon />
                </button>
              </div>
              <div className={styles.yearGrid}>
                {years.map((y) => (
                  <button
                    type='button'
                    key={y}
                    className={cn(styles.year, y === year && styles.selected)}
                    onClick={() => {
                      setCursor(new Date(y, month, 1))
                      setView('days')
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
