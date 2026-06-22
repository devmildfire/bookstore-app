// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders a <button> and fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Купить</Button>)
    const btn = screen.getByRole('button', { name: 'Купить' })
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled and unclickable while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Сохранить
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders a link (anchor) with href instead of a button', () => {
    render(<Button href='/cart'>В корзину</Button>)
    const link = screen.getByRole('link', { name: 'В корзину' })
    expect(link).toHaveAttribute('href', '/cart')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
