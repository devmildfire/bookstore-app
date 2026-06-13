import { Text } from '@react-email/components'
import BaseLayout, { ui, Link } from './_BaseLayout'

interface NewsletterConfirmProps {
  confirmUrl: string
}

export default function NewsletterConfirm({ confirmUrl }: NewsletterConfirmProps) {
  return (
    <BaseLayout preview='Подтвердите подписку на рассылку «Чтива»'>
      <Text style={ui.heading}>Подтвердите подписку</Text>
      <Text style={ui.paragraph}>
        Вы подписались на рассылку «Чтива». Подтвердите адрес, чтобы получать новости.
      </Text>
      <Text style={{ margin: '0 0 22px' }}>
        <Link href={confirmUrl} style={ui.button}>Подтвердить подписку</Link>
      </Text>
      <Text style={ui.muted}>
        Если кнопка не работает, скопируйте ссылку в браузер:
        <br />
        <Link href={confirmUrl} style={{ color: ui.colors.accent, wordBreak: 'break-all' }}>{confirmUrl}</Link>
      </Text>
      <Text style={ui.muted}>Если вы не подписывались, просто проигнорируйте это письмо.</Text>
    </BaseLayout>
  )
}
