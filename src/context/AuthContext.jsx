import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getCurrentUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, check if a token already exists from a previous session
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const profile = await getCurrentUser()
          setUser(profile)
        } catch (err) {
          // Token invalid or expired — clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  async function login(email, password) {
    // Step 1: get tokens
    const tokens = await loginUser(email, password)
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)

    // Step 2: fetch the actual profile using that token
    const profile = await getCurrentUser()
    setUser(profile)
    return profile
  }

  async function register(email, password, fullName) {
    const data = await registerUser(email, password, fullName)
    return data
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const value = { user, login, register, logout, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}