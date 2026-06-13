import { Text } from '@react-email/components'
import BaseLayout, { ui } from './_BaseLayout'

interface AdminStorySubmissionProps {
  authorName: string
  coverLetter?: string
  /** Storage object key of the uploaded manuscript (story-submissions bucket). */
  path: string
}

export default function AdminStorySubmission({ authorName, coverLetter, path }: AdminStorySubmissionProps) {
  return (
    <BaseLayout preview={`Новый рассказ: ${authorName}`}>
      <Text style={ui.heading}>Новый рассказ на рассмотрение</Text>
      <Text style={ui.paragraph}>
        <b>Автор:</b> {authorName}
      </Text>
      {coverLetter ? (
        <Text style={ui.paragraph}>
          <b>Сопроводительное письмо:</b>
          <br />
          {coverLetter}
        </Text>
      ) : null}
      <Text style={ui.muted}>
        Файл: {path}
        <br />
        Откройте раздел «Заявки» в админ-панели, чтобы скачать рукопись.
      </Text>
    </BaseLayout>
  )
}
