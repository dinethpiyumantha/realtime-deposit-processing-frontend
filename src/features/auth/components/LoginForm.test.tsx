import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import { LoginForm } from './LoginForm'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('@/store/auth.store', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}))

describe('LoginForm', () => {
  it('shows validation error when API key is empty', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('API key is required')).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('submits valid API key and navigates to dashboard', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/api key/i), 'dev-api-key')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockLogin).toHaveBeenCalledWith('dev-api-key')
    expect(mockToastSuccess).toHaveBeenCalledWith('Authenticated successfully')
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
