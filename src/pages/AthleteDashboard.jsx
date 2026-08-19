import { supabase } from '../services/supabase'

const AthleteDashboard = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center flex-col p-6">
      <div className="bg-white p-10 rounded-3xl card-shadow border border-gray-100 max-w-2xl text-center">
        <i className="fas fa-running text-6xl text-blue-500 mb-4"></i>
        <h2 className="text-3xl font-bold">Athlete Dashboard</h2>
        <div className="mt-4 p-6 bg-blue-50/60 rounded-2xl border border-blue-100">
          <p className="text-xl font-semibold text-blue-800">AI Video Analysis Module</p>
          <p className="text-gray-500 mt-1">Coming soon — sprint & jump assessment</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl text-sm font-medium transition"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default AthleteDashboard