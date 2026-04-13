import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const handleSuccess = async (credentialResponse) => {
    try {
      await login(credentialResponse.credential)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  const features = [
    { icon: '📊', title: 'Track Progress', desc: 'Visualize your weight progression and volume over time with interactive charts' },
    { icon: '🏋️', title: 'Log Workouts', desc: 'Quickly log multiple sets per exercise with smart suggestions from your history' },
    { icon: '📈', title: 'Analyze Data', desc: 'Filter, sort, and search your workout data with an Excel-like table view' },
    { icon: '☁️', title: 'Sync Anywhere', desc: 'Your data is securely stored in the cloud and accessible from any device' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-12 gap-12 max-w-6xl mx-auto w-full">

        {/* Left: branding + features */}
        <div className="flex-1 text-center lg:text-left max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-indigo-200 text-xs font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Free &middot; Open Source &middot; Self-hosted
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Gym Tracker
          </h1>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Your personal workout companion. Log exercises, track progressive overload, and visualize your gains — all in one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-indigo-200 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: sign-in card */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Get Started</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in with your Google account to start tracking your workouts</p>

            {error && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google sign-in failed')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="300"
              />
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Your data stays private. We only use your Google profile to identify your account.
            </p>
          </div>

          <p className="text-center text-indigo-300 text-xs mt-6">
            No credit card required &middot; Works on mobile &middot; Data stays yours
          </p>
        </div>
      </div>
    </div>
  )
}
