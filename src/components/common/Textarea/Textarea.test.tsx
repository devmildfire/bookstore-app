// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Textarea from './Textarea'

describe('Textarea', () => {
  it('bare mode renders just a textarea', () => {
    const { container } = render(<Textarea placeholder='Отзыв' />)
    expect(screen.getByPlaceholderText('Отзыв')).toBeInTheDocument()
    expect(container.querySelector('label')).toBeNull()
  })

  it('wrapped mode links the label and shows the error over the hint', () => {
    render(<Textarea label='Био' error='err' hint='hint' />)
    expect(screen.getByLabelText('Био')).toBeInTheDocument()
    expect(screen.getByText('err')).toBeInTheDocument()
    expect(screen.queryByText('hint')).not.toBeInTheDocument()
  })

  it('accepts typed text', async () => {
    render(<Textarea aria-label='note' />)
    const ta = screen.getByLabelText('note')
    await userEvent.type(ta, 'привет')
    expect(ta).toHaveValue('привет')
  })
})
