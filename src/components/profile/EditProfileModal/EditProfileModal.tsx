'use client'

import * as Dialog from '@radix-ui/react-dialog'
import ProfileEditor from '@/components/profile/ProfileEditor'
import styles from './EditProfileModal.module.scss'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditProfileModal({ open, onOpenChange }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <Dialog.Title className={styles.title}>Редактировать профиль</Dialog.Title>
          <ProfileEditor onDone={() => onOpenChange(false)} />
          <Dialog.Close className={styles.close} aria-label='Закрыть'>×</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
