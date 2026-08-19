import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

const AthleteRegister = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    district: '',
    state: '',
    aadhar: '',
    sports: []
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const sportsList = [
    'Cricket',
    'Football',
    'Basketball',
    'Athletics',
    'Swimming',
    'Tennis',
    'Badminton',
    'Kabaddi',
    'Volleyball',
    'Hockey'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSportChange = (e) => {
    const options = e.target.options
    const selected = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value)
    }
    setForm((prev) => ({ ...prev, sports: selected }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ type: '', text: '' })

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      })
      if (error) throw new Error(error.message)

      const userId = data.user.id

      // Insert athlete profile
      const { error: insertError } = await supabase.from('athletes').insert([
        {
          id: userId,
          full_name: form.full_name,
          email: form.email,
          age: parseInt(form.age),
          gender: form.gender,
          height: parseFloat(form.height) || null,
          weight: parseFloat(form.weight) || null,
          district: form.district,
          state: form.state,
          aadhar: form.aadhar,
          sports: form.sports
        }
      ])

      if (insertError) throw new Error(insertError.message)

      setMsg({
        type: 'success',
        text: '✅ Athlete registered! Redirecting to login...'
      })
      setTimeout(() => navigate('/athlete-login'), 2000)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50/40">
      <div className="auth-card bg-white/80 backdrop-blur-sm p-8 rounded-3xl card-shadow border border-white/50">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">🏃 Athlete Registration</h2>
          <p className="text-gray-500 text-sm mt-1">Create your profile & get discovered</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Age *</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Gender *</label>
              <div className="radio-group flex gap-4 pt-1">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === 'male'}
                    onChange={handleChange}
                  />{' '}
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === 'female'}
                    onChange={handleChange}
                  />{' '}
                  Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={form.gender === 'other'}
                    onChange={handleChange}
                  />{' '}
                  Other
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                step="0.1"
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                step="0.1"
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">District *</label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">State *</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Aadhar No.</label>
              <input
                name="aadhar"
                value={form.aadhar}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Sports played (hold Ctrl/Cmd to select multiple) *
              </label>
              <select
                multiple
                name="sports"
                value={form.sports}
                onChange={handleSportChange}
                className="w-full p-2.5 border rounded-xl input-focus bg-white/70 h-28 multi-select"
                required
              >
                {sportsList.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {msg.text && (
            <div
              className={`p-3 rounded-xl text-sm ${
                msg.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-user-plus"></i> Register as Athlete
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/athlete-login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default AthleteRegister