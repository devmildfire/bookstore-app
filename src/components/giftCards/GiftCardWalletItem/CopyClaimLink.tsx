'use client'

import { useToast } from '@/contexts/toast'
import styles from './GiftCardWalletItem.module.scss'

type Props = {
  claimUrl: string
}

// Client leaf: copy the claim link to the clipboard. Split out so the wallet item body
// (image, balance, status, recipient/date) renders on the server.
export default function CopyClaimLink({ claimUrl }: Props) {
  const { success } = useToast()

  async function copyClaim() {
    await navigator.clipboard.writeText(`${window.location.origin}${claimUrl}`)
    success('Ссылка скопирована')
  }

  return (
    <button type='button' className={styles.copyLink} onClick={copyClaim}>
      Скопировать ссылку
    </button>
  )
}
