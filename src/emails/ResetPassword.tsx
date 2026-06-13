import { Text } from '@react-email/components'
import BaseLayout, { ui, Link } from './_BaseLayout'

interface ResetPasswordProps {
  resetUrl: string
}

export default function ResetPassword({ resetUrl }: ResetPasswordProps) {
  return (
    <BaseLayout preview='Сброс пароля в «Чтиве»'>
      <Text style={ui.heading}>Сброс пароля</Text>
      <Text style={ui.paragraph}>
        Мы получили запрос на сброс пароля для вашего аккаунта «Чтиво». Нажмите кнопку, чтобы
        задать новый пароль.
      </Text>
      <Text style={{ margin: '0 0 22px' }}>
        <Link href={resetUrl} style={ui.button}>Задать новый пароль</Link>
      </Text>
      <Text style={ui.muted}>
        Если кнопка не работает, скопируйте ссылку в браузер:
        <br />
        <Link href={resetUrl} style={{ color: ui.colors.accent, wordBreak: 'break-all' }}>{resetUrl}</Link>
      </Text>
      <Text style={ui.muted}>
        Если вы не запрашивали сброс пароля, проигнорируйте это письмо — пароль останется
        прежним.
      </Text>
    </BaseLayout>
  )
}
