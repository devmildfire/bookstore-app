// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} title='Заголовок'>
        тело
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Заголовок')).not.toBeInTheDocument()
  })

  it('renders the title and children when open', () => {
    render(
      <Modal open title='Заголовок'>
        тело
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Заголовок')).toBeInTheDocument()
    expect(screen.getByText('тело')).toBeInTheDocument()
  })

  it('calls onOpenChange(false) when the close button is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <Modal open title='Заголовок' onOpenChange={onOpenChange}>
        тело
      </Modal>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('opens from its trigger (uncontrolled)', async () => {
    render(
      <Modal trigger={<button>Открыть</button>} title='Заголовок'>
        тело
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Открыть' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
