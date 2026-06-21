import HalError from '@/components/common/HalError'
import css from './not-found.module.scss'

// Root 404 — chromeless (no Header/Footer). Catches unmatched URLs outside the
// (site) route group: /admin/*, /api/*, and any path not under a layout with its
// own not-found.tsx. The storefront group has its own (site)/not-found.tsx so
// storefront 404s keep the Header/Footer chrome.
export default function RootNotFound() {
  return (
    <div className={css.page}>
      <HalError code='404' phrase='Мне жаль, Дейв, боюсь, я не могу этого найти' />
    </div>
  )
}
