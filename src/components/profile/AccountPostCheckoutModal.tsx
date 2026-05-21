'use client'

import { useState } from 'react'
import AnonRecoveryModal from '@/components/profile/AnonRecoveryModal'

// Mounted by /profile/page.tsx when an anonymous user lands from a
// successful checkout (`?from=checkout`). Opens the modal once on mount.
export default function AccountPostCheckoutModal() {
  const [open, setOpen] = useState(true)
  return <AnonRecoveryModal open={open} onOpenChange={setOpen} />
}
