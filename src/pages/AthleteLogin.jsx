import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

const AthleteLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw new Error(error.message)

      // Check if athlete profile exists
      const { data: athlete, error: profError } = await supabase
        .from('athletes')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (profError || !athlete) {
        await supabase.auth.signOut()
        throw new Error('Athlete profile not found. Please register.')
      }

      navigate('/athlete-dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50/40">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-3xl card-shadow border border-white/50">
        <div className="text-center">
          <i className="fas fa-user-circle text-5xl text-blue-600 mb-2"></i>
          <h2 className="text-2xl font-bold">Athlete Login</h2>
          <p className="text-gray-500 text-sm">Welcome back</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2.5 border rounded-xl input-focus"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2.5 border rounded-xl input-focus"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-500">
            New athlete?{' '}
            <Link to="/athlete-register" className="text-blue-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default AthleteLogin