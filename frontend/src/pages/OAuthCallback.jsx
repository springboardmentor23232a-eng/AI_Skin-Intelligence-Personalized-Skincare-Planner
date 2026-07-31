import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('No login token received from Google.')
      return
    }
    loginWithToken(token)
      .then(() => navigate('/dashboard'))
      .catch(() => setError('Could not complete Google sign-in. Please try again.'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        {error ? (
          <>
            <p className="text-red-500 mb-2">{error}</p>
            <a href="/login" className="text-primary-600 underline text-sm">Back to login</a>
          </>
        ) : (
          <p className="text-gray-500">Signing you in with Google...</p>
        )}
      </div>
    </div>
  )
}