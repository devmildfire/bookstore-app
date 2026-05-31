import type { AddToCartInput } from '@/entities/cart/validation'

// The single "Мастерская Абзац" author course, sold through the cart like a
// gift card (category 'Course'). The /abzac page is currently pre-registration
// only ("обозначить интерес"), so the price is a deliberate placeholder of 0
// (free interest sign-up) until course pricing is decided.
export const ABZAC_COURSE: AddToCartInput = {
  id: 'Course-abzac-masterclass',
  name: 'Мастерская Абзац',
  subtitle: 'Онлайн-курс для авторов',
  price: 0,
  // Portrait 2:3 cover (full «Мастерская Абзац» mark on the course backdrop)
  // so it fits the cart thumbnail without cropping — the wide hero banner did.
  picture: '/abzac/course-cover.jpg',
  discount: null,
  category: 'Course',
}
