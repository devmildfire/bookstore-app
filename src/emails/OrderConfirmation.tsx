import { Hr, Row, Column, Text } from '@react-email/components'
import BaseLayout, { ui } from './_BaseLayout'

export interface OrderConfirmationItem {
  name: string
  quantity: number
  price: number
  boxSetName: string | null
}

interface OrderConfirmationProps {
  orderId: number
  total: number
  items: OrderConfirmationItem[]
}

const money = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

export default function OrderConfirmation({ orderId, total, items }: OrderConfirmationProps) {
  return (
    <BaseLayout preview={`Заказ №${orderId} оплачен`}>
      <Text style={ui.heading}>Заказ №{orderId} оплачен</Text>
      <Text style={ui.paragraph}>Спасибо за покупку в «Чтиве»! Вот состав вашего заказа:</Text>

      <Hr style={{ borderColor: ui.colors.border, margin: '0 0 12px' }} />
      {items.map((item, i) => (
        <Row key={i} style={{ marginBottom: 8 }}>
          <Column style={{ color: ui.colors.text, fontSize: 14 }}>
            {item.name}
            {item.boxSetName ? ` (из бокс-сета «${item.boxSetName}»)` : ''}
            {item.quantity > 1 ? ` × ${item.quantity}` : ''}
          </Column>
          <Column style={{ color: ui.colors.text, fontSize: 14, textAlign: 'right', whiteSpace: 'nowrap' }}>
            {money(item.price * item.quantity)}
          </Column>
        </Row>
      ))}
      <Hr style={{ borderColor: ui.colors.border, margin: '12px 0' }} />

      <Row>
        <Column style={{ color: ui.colors.title, fontSize: 16, fontWeight: 700 }}>Итого</Column>
        <Column style={{ color: ui.colors.title, fontSize: 16, fontWeight: 700, textAlign: 'right' }}>
          {money(total)}
        </Column>
      </Row>

      <Text style={{ ...ui.muted, marginTop: 18 }}>
        Историю заказов и цифровые покупки можно найти в личном кабинете.
      </Text>
    </BaseLayout>
  )
}
