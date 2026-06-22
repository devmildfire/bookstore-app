'use client'

import Modal from '@/components/common/Modal'
import ProfileEditor from '@/components/profile/ProfileEditor'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditProfileModal({ open, onOpenChange }: Props) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title='Редактировать профиль' size='lg'>
      <ProfileEditor onDone={() => onOpenChange(false)} />
    </Modal>
  )
}
