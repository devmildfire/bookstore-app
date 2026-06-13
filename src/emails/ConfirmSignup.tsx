import { Text } from '@react-email/components'
import BaseLayout, { ui, Link } from './_BaseLayout'

interface ConfirmSignupProps {
  confirmUrl: string
  /** True for an email-change confirmation (anon→account upgrade), false for a fresh signup. */
  isEmailChange?: boolean
}

export default function ConfirmSignup({ confirmUrl, isEmailChange = false }: ConfirmSignupProps) {
  const heading = isEmailChange ? 'Подтвердите смену email' : 'Подтвердите ваш email'
  return (
    <BaseLayout preview={heading}>
      <Text style={ui.heading}>{heading}</Text>
      <Text style={ui.paragraph}>
        {isEmailChange
          ? 'Вы привязали этот адрес к аккаунту «Чтиво». Подтвердите его, чтобы завершить.'
          : 'Спасибо за регистрацию в «Чтиве». Подтвердите адрес, чтобы активировать аккаунт.'}
      </Text>
      <Text style={{ margin: '0 0 22px' }}>
        <Link href={confirmUrl} style={ui.button}>
          {isEmailChange ? 'Подтвердить адрес' : 'Подтвердить email'}
        </Link>
      </Text>
      <Text style={ui.muted}>
        Если кнопка не работает, скопируйте ссылку в браузер:
        <br />
        <Link href={confirmUrl} style={{ color: ui.colors.accent, wordBreak: 'break-all' }}>{confirmUrl}</Link>
      </Text>
      <Text style={ui.muted}>Если вы не регистрировались в «Чтиве», просто проигнорируйте это письмо.</Text>
    </BaseLayout>
  )
}
