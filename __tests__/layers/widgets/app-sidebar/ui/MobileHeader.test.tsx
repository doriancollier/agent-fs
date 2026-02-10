/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MobileHeader } from '@/layers/widgets/app-sidebar/ui/MobileHeader'
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

function Wrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}

describe('MobileHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with app name', () => {
    render(<MobileHeader />, { wrapper: Wrapper })

    expect(screen.getByText('Boilerplate')).toBeInTheDocument()
  })

  it('renders header element', () => {
    render(<MobileHeader />, { wrapper: Wrapper })

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('has md:hidden class for mobile-only visibility', () => {
    render(<MobileHeader />, { wrapper: Wrapper })

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('md:hidden')
  })
})
