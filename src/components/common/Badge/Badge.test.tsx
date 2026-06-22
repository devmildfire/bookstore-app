// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>В наличии</Badge>)
    expect(screen.getByText('В наличии')).toBeInTheDocument()
  })

  it('renders as a span and forwards a custom className', () => {
    render(<Badge className='extra'>x</Badge>)
    const el = screen.getByText('x')
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('extra')
  })
})
