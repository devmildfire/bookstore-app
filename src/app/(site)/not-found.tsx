import HalError from '@/components/common/HalError'
import css from './not-found.module.scss'

// Storefront 404 — renders inside the (site) layout, so Header/Footer chrome is
// present. The root not-found.tsx (chromeless) handles /admin, /api, and other
// non-storefront misses.
export default function NotFound() {
  return (
    <div className={css.page}>
      <HalError code='404' phrase='Мне жаль, Дейв, боюсь, я не могу этого найти' />
    </div>
  )
}
