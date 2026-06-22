// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkbox from './Checkbox'

describe('Checkbox', () => {
  it('renders a checkbox with a linked label', () => {
    render(<Checkbox label='Согласен' />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText('Согласен')).toBeInTheDocument()
  })

  it('fires onCheckedChange when clicked', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox label='x' onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('does not fire when disabled', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox label='x' disabled onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})
