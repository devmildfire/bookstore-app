'use client'

import { useState, useRef, useEffect } from 'react'
import cn from 'classnames'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/common/icons'
import styles from './DatePicker.module.scss'

// Custom date / date-time picker (Radix ships no calendar primitive). Same
// open/outside-click/Escape pattern as Select, styled like Input.
// Works uncontrolled (defaultValue + hidden input for plain forms) or controlled
// (value + onChange, e.g. with react-hook-form). With `withTime` it also edits a
// HH:MM time and the value is `YYYY-MM-DDTHH:MM` (datetime-local); otherwise the
// value is `YYYY-MM-DD`.

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
function datePart(v: string): string {
  return v.split('T')[0] ?? ''
}
function timePart(v: string): string {
  return v.includes('T') ? (v.split('T')[1] ?? '') : ''
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function parseISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}
function clampNum(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isNaN(n) ? min : n))
}

type Props = {
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  withTime?: boolean
  /** Year-only picker: value is `YYYY`, the popover shows only the year grid. */
  yearOnly?: boolean
  ariaLabel?: string
  placeholder?: string
}

export default function DatePicker({
  name,
  value,
  defaultValue = '',
  onChange,
  withTime = false,
  yearOnly = false,
  ariaLabel,
  placeholder,
}: Props) {
  const controlled = value !== undefined
  const [inner, setInner] = useState(defaultValue)
  const v = controlled ? (value ?? '') : inner

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'days' | 'years'>(yearOnly ? 'years' : 'days')
  const startYear = yearOnly ? Number(v) || new Date().getFullYear() : (parseISO(v) ?? new Date()).getFullYear()
  const startMonth = yearOnly ? 0 : (parseISO(v) ?? new Date()).getMonth()
  const [cursor, setCursor] = useState(() => new Date(startYear, startMonth, 1))
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

  function commit(next: string) {
    if (!controlled) setInner(next)
    onChange?.(next)
  }

  const selected = parseISO(v)
  const selectedYear = yearOnly ? Number(v) || null : null
  const time = timePart(v) || (withTime ? '00:00' : '')
  const [hh, mm] = time ? time.split(':') : ['00', '00']

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const offset = (firstDay.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - offset)
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
  const decadeStart = year - (((year % 12) + 12) % 12)
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i)

  function pickDay(d: Date) {
    const iso = toISO(d)
    if (withTime) {
      commit(`${iso}T${time || '00:00'}`)
    } else {
      commit(iso)
      setOpen(false)
    }
    setView('days')
  }

  function setTime(nextHH: string, nextMM: string) {
    const iso = datePart(v) || toISO(new Date())
    commit(`${iso}T${nextHH}:${nextMM}`)
  }

  function display(): string {
    if (yearOnly) return v || (placeholder ?? 'гггг')
    const d = parseISO(v)
    if (!d) return placeholder ?? (withTime ? 'дд.мм.гггг чч:мм' : 'дд.мм.гггг')
    const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
    return withTime ? `${date} ${hh}:${mm}` : date
  }

  return (
    <div className={cn(styles.picker, open && styles.open)} ref={ref}>
      {name && <input type='hidden' name={name} value={v} />}
      <button
        type='button'
        className={styles.trigger}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn(styles.value, !v && styles.placeholder)}>{display()}</span>
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
                      onClick={() => pickDay(d)}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>

              {withTime && (
                <div className={styles.time}>
                  <span className={styles.timeLabel}>Время</span>
                  <input
                    type='number'
                    min={0}
                    max={23}
                    value={hh}
                    aria-label='Часы'
                    className={styles.timeField}
                    onChange={(e) => setTime(pad(clampNum(Number(e.target.value), 0, 23)), mm)}
                  />
                  <span className={styles.timeColon}>:</span>
                  <input
                    type='number'
                    min={0}
                    max={59}
                    value={mm}
                    aria-label='Минуты'
                    className={styles.timeField}
                    onChange={(e) => setTime(hh, pad(clampNum(Number(e.target.value), 0, 59)))}
                  />
                </div>
              )}

              <div className={styles.foot}>
                <button type='button' className={styles.footBtn} onClick={() => pickDay(new Date())}>
                  Сегодня
                </button>
                {withTime && (
                  <button type='button' className={styles.footBtn} onClick={() => setOpen(false)}>
                    Готово
                  </button>
                )}
                {v && (
                  <button
                    type='button'
                    className={styles.footBtn}
                    onClick={() => {
                      commit('')
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
                    className={cn(styles.year, (yearOnly ? y === selectedYear : y === year) && styles.selected)}
                    onClick={() => {
                      if (yearOnly) {
                        commit(String(y))
                        setCursor(new Date(y, 0, 1))
                        setOpen(false)
                        return
                      }
                      setCursor(new Date(y, month, 1))
                      setView('days')
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
              {yearOnly && v && (
                <div className={styles.foot}>
                  <button
                    type='button'
                    className={styles.footBtn}
                    onClick={() => {
                      commit('')
                      setOpen(false)
                    }}
                  >
                    Очистить
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
