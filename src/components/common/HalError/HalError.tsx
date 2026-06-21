import cn from 'classnames'
import Button from '@/components/common/Button'
import HalEye from '@/assets/images/hal-eye.svg'
import css from './HalError.module.scss'

type Code = '404' | '500'

type Props = {
  code: Code
  phrase: string
  /** Retry handler — when provided, a "Попробовать снова" button renders alongside the home link. */
  onRetry?: () => void
  className?: string
}

// Shared HAL 9000–themed error surface for 404/500 pages. Server Component safe
// (no hooks/browser APIs) so it can render inside both `not-found.tsx` (Server)
// and `error.tsx`/`global-error.tsx` (Client). The eye is the cleaned Wikimedia
// HAL9000.svg (CC-BY 3.0, attribution in the SVG file). The nameplate ABOVE the
// eye mirrors HAL's two-part panel: solid blue "HAL" cell (left) + transparent
// blue-bordered code cell (right). Letters use the Syncopate font (geometric,
// open counters) with -webkit-text-stroke for clean hollow outlines.
export default function HalError({ code, phrase, onRetry, className }: Props) {
  return (
    <div className={cn(css.wrap, className)} role='alert'>
      <div className={css.nameplate} role='text'>
        <span className={css.halCell}>HAL</span>
        <span className={css.codeCell}>{code}</span>
      </div>

      <div className={css.eye} aria-hidden='true'>
        <HalEye className={css.eyeSvg} />
      </div>

      <p className={css.phrase}>{phrase}</p>

      <div className={css.actions}>
        {onRetry && (
          <Button type='button' variant='primary' onClick={onRetry}>
            Попробовать снова
          </Button>
        )}
        <Button type='button' variant={onRetry ? 'secondary' : 'primary'} href='/'>
          На главную
        </Button>
      </div>
    </div>
  )
}
