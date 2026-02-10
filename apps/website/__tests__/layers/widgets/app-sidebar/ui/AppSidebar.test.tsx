/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppSidebar } from '@/layers/widgets/app-sidebar/ui/AppSidebar'
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
  usePathname: vi.fn(() => '/'),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with header showing app name', () => {
    render(<AppSidebar />, { wrapper: Wrapper })

    expect(screen.getByText('Boilerplate')).toBeInTheDocument()
  })

  it('renders with collapsed icon "B"', () => {
    render(<AppSidebar />, { wrapper: Wrapper })

    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<AppSidebar />, { wrapper: Wrapper })

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /example/i })).toBeInTheDocument()
  })
})
