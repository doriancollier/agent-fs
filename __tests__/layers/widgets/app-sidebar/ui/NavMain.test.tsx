/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NavMain } from '@/layers/widgets/app-sidebar/ui/NavMain'
import { SidebarProvider } from '@/components/ui/sidebar'

// Mock window.matchMedia for jsdom
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

import { usePathname } from 'next/navigation'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}

describe('NavMain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePathname).mockReturnValue('/')
  })

  it('renders all navigation items', () => {
    render(<NavMain />, { wrapper: Wrapper })

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /example/i })).toBeInTheDocument()
  })

  it('renders Home link with correct href', () => {
    render(<NavMain />, { wrapper: Wrapper })

    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveAttribute('href', '/system')
  })

  it('renders Example link with correct href', () => {
    render(<NavMain />, { wrapper: Wrapper })

    const exampleLink = screen.getByRole('link', { name: /example/i })
    expect(exampleLink).toHaveAttribute('href', '/example')
  })

  it('marks Home as active when pathname is "/system"', () => {
    vi.mocked(usePathname).mockReturnValue('/system')

    render(<NavMain />, { wrapper: Wrapper })

    const homeItem = screen.getByRole('link', { name: /home/i }).closest('li')
    expect(homeItem?.querySelector('[data-active="true"]')).toBeInTheDocument()
  })

  it('marks Example as active when pathname is "/example"', () => {
    vi.mocked(usePathname).mockReturnValue('/example')

    render(<NavMain />, { wrapper: Wrapper })

    const exampleItem = screen.getByRole('link', { name: /example/i }).closest('li')
    expect(exampleItem?.querySelector('[data-active="true"]')).toBeInTheDocument()
  })
})
