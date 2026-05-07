import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthProvider, useAuth } from './auth.store'

function AuthProbe() {
  const { apiKey, isAuthenticated, login, logout } = useAuth()

  return (
    <div>
      <p data-testid="api-key">{apiKey ?? 'none'}</p>
      <p data-testid="is-auth">{String(isAuthenticated)}</p>
      <button onClick={() => login('dev-api-key')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthProvider / useAuth', () => {
  it('hydrates initial auth state from localStorage', () => {
    localStorage.setItem('api_key', 'seed-key')

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    expect(screen.getByTestId('api-key')).toHaveTextContent('seed-key')
    expect(screen.getByTestId('is-auth')).toHaveTextContent('true')
  })

  it('login and logout update auth state and localStorage', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(localStorage.getItem('api_key')).toBe('dev-api-key')
    expect(screen.getByTestId('is-auth')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: /logout/i }))
    expect(localStorage.getItem('api_key')).toBeNull()
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false')
  })

  it('throws if useAuth is used without AuthProvider', () => {
    expect(() => render(<AuthProbe />)).toThrow('useAuth must be used within AuthProvider')
  })
})
