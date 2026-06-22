// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NumberStepper from './NumberStepper'

describe('NumberStepper', () => {
  it('controlled: +/− call onChange with the stepped value', async () => {
    const onChange = vi.fn()
    render(<NumberStepper value={2} onChange={onChange} min={0} max={5} aria-label='qty' />)
    await userEvent.click(screen.getByLabelText('Увеличить'))
    expect(onChange).toHaveBeenLastCalledWith(3)
    await userEvent.click(screen.getByLabelText('Уменьшить'))
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('disables − at min and + at max', () => {
    const { rerender } = render(<NumberStepper value={0} min={0} max={5} aria-label='q' />)
    expect(screen.getByLabelText('Уменьшить')).toBeDisabled()
    rerender(<NumberStepper value={5} min={0} max={5} aria-label='q' />)
    expect(screen.getByLabelText('Увеличить')).toBeDisabled()
  })

  it('uncontrolled: strips non-digits from typed input', async () => {
    render(<NumberStepper defaultValue={1} aria-label='qty' />)
    const input = screen.getByLabelText<HTMLInputElement>('qty')
    await userEvent.clear(input)
    await userEvent.type(input, '1a2')
    expect(input.value).toBe('12')
  })
})
