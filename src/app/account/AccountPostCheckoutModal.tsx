'use client'

import { useState } from 'react'
import AnonRecoveryModal from '@/components/account/AnonRecoveryModal'

// Mounted by the Server Component when an anonymous user lands on /account
// directly from a successful checkout. Opens the modal exactly once per
// landing; closing it cannot reopen without another checkout redirect.
export default function AccountPostCheckoutModal() {
  const [open, setOpen] = useState(true)
  return <AnonRecoveryModal open={open} onOpenChange={setOpen} />
}
