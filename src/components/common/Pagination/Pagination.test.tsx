// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Pagination from './Pagination'

const href = (p: number) => `?page=${p}`

describe('Pagination', () => {
  it('renders nothing when there is a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} hrefForPage={href} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('simple variant shows position and prev/next', () => {
    render(<Pagination page={2} totalPages={5} hrefForPage={href} variant='simple' />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Назад' })).toHaveAttribute('href', '?page=1')
    expect(screen.getByRole('link', { name: 'Вперёд' })).toHaveAttribute('href', '?page=3')
  })

  it('disables prev on the first page (renders a non-link)', () => {
    render(<Pagination page={1} totalPages={5} hrefForPage={href} variant='simple' />)
    expect(screen.queryByRole('link', { name: 'Назад' })).not.toBeInTheDocument()
    const back = screen.getByText('Назад')
    expect(back).toHaveAttribute('aria-disabled', 'true')
  })

  it('numbered variant links to page numbers', () => {
    render(<Pagination page={1} totalPages={3} hrefForPage={href} variant='numbered' />)
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '?page=2')
  })
})
