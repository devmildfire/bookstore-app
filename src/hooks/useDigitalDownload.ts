import { useCallback, useState } from 'react'
import { getDownloadUrlAction } from '@/lib/orders/actions'

// Russian copy for each server-side failure reason.
const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: 'Нужно войти.',
  not_owner: 'Не ваш заказ.',
  not_digital: 'Цифровая версия недоступна.',
  no_file: 'Цифровая версия пока недоступна.',
  sign_failed: 'Не удалось создать ссылку.',
}

// Shared download behaviour for owned digital editions, used by both the
// «Мои книги» library and the «Заказы» order history. Given an OrderItem id it
// asks the server for a fresh signed URL (the server gifts the title's digital
// edition for a physical purchase) and triggers a browser download. One hook
// instance per item → independent busy/error state.
export default function useDigitalDownload() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const download = useCallback(async (orderItemId: number) => {
    setBusy(true)
    setError(null)
    const result = await getDownloadUrlAction(orderItemId)
    setBusy(false)
    if (result.status === 'ok') {
      const a = document.createElement('a')
      a.href = result.url
      a.rel = 'noopener'
      a.download = ''
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }
    setError(ERROR_MESSAGES[result.reason] ?? 'Ошибка.')
  }, [])

  return { download, busy, error }
}
