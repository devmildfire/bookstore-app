import styles from './PeriodicalView.module.scss'

// «Cheque» (the display face) has no № glyph, so a literal "№" falls back to a
// serif and clashes with the Cheque digits. Compose the mark from Cheque's own
// letters: a capital N + a small raised, underlined o, then the number.
export default function Numero({ n, className }: { n: number | null; className?: string }) {
  return (
    <span className={className ? `${styles.numero} ${className}` : styles.numero} aria-label={`№${n ?? ''}`}>
      <span aria-hidden className={styles.numeroNo}>
        N<span className={styles.numeroO}>o</span>
      </span>
      {n != null && <span className={styles.numeroDigits}>{n}</span>}
    </span>
  )
}
