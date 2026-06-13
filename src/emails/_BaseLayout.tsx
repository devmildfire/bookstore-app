import type { ReactNode } from 'react'
import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'

// Brand shell shared by every email template. React Email renders to inline-styled
// HTML, so the palette is hard-coded here (mirrors src/styles/params.scss):
//   page #0A0A0A · surface #1A1A1A · title #E0E0E0 · muted rgba(220,220,220,.7) · accent #A10202
const colors = {
  page: '#0A0A0A',
  surface: '#1A1A1A',
  title: '#E0E0E0',
  text: '#DCDCDC',
  muted: 'rgba(220, 220, 220, 0.7)',
  accent: '#A10202',
  border: 'rgba(220, 220, 220, 0.12)',
}

interface BaseLayoutProps {
  /** Inbox preview snippet (hidden in the body). */
  preview: string
  children: ReactNode
}

export default function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html lang='ru'>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.page, margin: 0, padding: '24px 0', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <Container style={{ maxWidth: 520, margin: '0 auto', backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
          <Section style={{ padding: '28px 32px 8px' }}>
            <Text style={{ margin: 0, color: colors.accent, fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>ЧТИВО</Text>
          </Section>
          <Section style={{ padding: '8px 32px 28px', color: colors.text, fontSize: 15, lineHeight: '1.6' }}>
            {children}
          </Section>
          <Hr style={{ borderColor: colors.border, margin: 0 }} />
          <Section style={{ padding: '18px 32px 26px' }}>
            <Text style={{ margin: 0, color: colors.muted, fontSize: 12, lineHeight: '1.5' }}>
              Издательство «Чтиво». Это письмо отправлено автоматически — отвечать на него не нужно.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Shared inline-style primitives templates can reuse, so each template doesn't
// re-declare the palette.
export const ui = {
  colors,
  heading: { margin: '0 0 12px', color: colors.title, fontSize: 20, fontWeight: 700 } as const,
  paragraph: { margin: '0 0 14px', color: colors.text, fontSize: 15, lineHeight: '1.6' } as const,
  muted: { margin: '0 0 14px', color: colors.muted, fontSize: 13, lineHeight: '1.5' } as const,
  button: {
    display: 'inline-block',
    backgroundColor: colors.accent,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
    padding: '12px 26px',
    borderRadius: 8,
  } as const,
}

export { Link }
