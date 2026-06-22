// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input', () => {
  it('bare mode renders just an input (no label wrapper)', () => {
    const { container } = render(<Input placeholder='Имя' />)
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument()
    expect(container.querySelector('label')).toBeNull()
  })

  it('wrapped mode renders a label linked to the input', () => {
    render(<Input label='Город' />)
    expect(screen.getByLabelText('Город')).toBeInTheDocument()
  })

  it('shows the error and hides the hint when both are set', () => {
    render(<Input label='Email' error='Обязательно' hint='подсказка' />)
    expect(screen.getByText('Обязательно')).toBeInTheDocument()
    expect(screen.queryByText('подсказка')).not.toBeInTheDocument()
  })

  it('shows the hint when there is no error', () => {
    render(<Input label='Email' hint='подсказка' />)
    expect(screen.getByText('подсказка')).toBeInTheDocument()
  })

  it('number mode is a decimal text field that strips non-numeric input', async () => {
    render(<Input type='number' aria-label='qty' />)
    const input = screen.getByLabelText<HTMLInputElement>('qty')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'decimal')
    await userEvent.type(input, 'a1b2')
    expect(input.value).toBe('12')
  })
})
