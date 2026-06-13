'use client'

import Button from '@/components/common/Button'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import { ABZAC_COURSE } from '@/consts/abzacCourse'

type Props = {
  className?: string
}

// "Обучаться" CTA — adds the Мастерская Абзац course to the cart (one per
// buyer) like the gift-card storefront, then confirms with a cart toast.
export default function AbzacEnrollButton({ className }: Props) {
  const { addItem } = useCart()
  const { cartSuccess } = useToast()

  function handleEnroll() {
    addItem(ABZAC_COURSE, 1)
    cartSuccess('Добавлено в корзину', ABZAC_COURSE.name)
  }

  return (
    <Button variant='cta' className={className} onClick={handleEnroll}>
      Обучаться
    </Button>
  )
}
