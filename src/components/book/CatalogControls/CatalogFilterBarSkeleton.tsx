import styles from './CatalogFilterBarSkeleton.module.scss'

// Static, non-interactive replica of the CatalogControls filter/sort bar — same pill, icons and
// divider, but plain markup (no Radix Dialog/Popover, which the bundle-shedding work keeps off the
// critical path). Shown under the eager ИЗДАНИЯ heading while the real catalog (controls + grid) is
// deferred, so the catalog reads as "present, loading" and the swap to the real bar is seamless.
// Icons are duplicated from CatalogControls deliberately (a handful of SVG lines) to avoid importing
// that component's full module here.
export default function CatalogFilterBarSkeleton() {
  return (
    <div className={styles.wrapper} aria-hidden>
      <div className={styles.controlBar}>
        <span className={styles.controlButton}>
          <FilterIcon />
        </span>
        <span className={styles.divider} />
        <span className={styles.controlButton}>
          <SortIcon />
        </span>
      </div>
    </div>
  )
}

function FilterIcon() {
  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' aria-hidden>
      <path d='M10 7V27M24 7V27' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <circle cx='10' cy='19' r='4' stroke='currentColor' strokeWidth='1.5' />
      <circle cx='24' cy='13' r='4' stroke='currentColor' strokeWidth='1.5' />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' aria-hidden>
      <path d='M12 7V27M12 27L7 22M12 27L17 22' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path d='M22 27V7M22 7L17 12M22 7L27 12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}
