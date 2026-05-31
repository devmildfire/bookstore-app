'use client'

import { useState } from 'react'
import PrimaryButton from '@/components/common/PrimaryButton'
import StorySubmitModal from './StorySubmitModal'

type Props = {
  className?: string
  children?: React.ReactNode
  isAnon: boolean
  userEmail: string | null
}

// Client island for the page hero: the primary CTA plus the submission modal
// it opens. Open state is controlled here so the modal resets on each open.
export default function StorySubmitButton({
  className,
  children = 'Отправить рассказ',
  isAnon,
  userEmail,
}: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <PrimaryButton className={className} onClick={() => setOpen(true)}>
        {children}
      </PrimaryButton>
      <StorySubmitModal
        open={open}
        onOpenChange={setOpen}
        isAnon={isAnon}
        userEmail={userEmail}
      />
    </>
  )
}
