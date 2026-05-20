'use client'

import { useState } from 'react'
import AnonRecoveryModal from '@/components/account/AnonRecoveryModal'
import styles from './AnonRecoveryBanner.module.scss'

export default function AnonRecoveryBanner() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={styles.banner}>
        <span className={styles.text}>
          Доступ к покупкам сохранён в куках этого браузера.
        </span>
        <button type='button' className={styles.link} onClick={() => setOpen(true)}>
          Привязать email →
        </button>
      </div>
      <AnonRecoveryModal open={open} onOpenChange={setOpen} />
    </>
  )
}
