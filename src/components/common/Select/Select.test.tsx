// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Select from './Select'

const options = [
  { value: 'a', label: 'Альфа' },
  { value: 'b', label: 'Бета' },
]

describe('Select', () => {
  it('shows the placeholder and opens the listbox on click', async () => {
    render(<Select options={options} placeholder='Выбрать' />)
    expect(screen.getByRole('button', { name: /Выбрать/ })).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Бета' })).toBeInTheDocument()
  })

  it('uncontrolled: picking an option updates the trigger and fires onChange', async () => {
    const onChange = vi.fn()
    render(<Select options={options} placeholder='Выбрать' onChange={onChange} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: 'Бета' }))
    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getByRole('button', { name: /Бета/ })).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('controlled: displays the value label and fires onValueChange on pick', async () => {
    const onValueChange = vi.fn()
    render(<Select options={options} value='a' onValueChange={onValueChange} />)
    expect(screen.getByRole('button', { name: /Альфа/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: 'Бета' }))
    expect(onValueChange).toHaveBeenCalledWith('b')
  })

  it('form mode: exposes the picked value via a hidden input', async () => {
    const { container } = render(<Select options={options} name='sort' defaultValue='a' />)
    expect(container.querySelector<HTMLInputElement>('input[name="sort"]')!.value).toBe('a')
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('option', { name: 'Бета' }))
    expect(container.querySelector<HTMLInputElement>('input[name="sort"]')!.value).toBe('b')
  })
})
