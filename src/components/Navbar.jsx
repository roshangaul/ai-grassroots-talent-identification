import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 border-b-2 border-blue-600'
      : 'text-gray-600 hover:text-blue-600'

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
        <div className="flex items-center space-x-2">
          <i className="fas fa-brain text-blue-600 text-2xl"></i>
          <span className="text-xl font-bold tracking-tight text-gray-800">
            Talent<span className="text-blue-600">AI</span>
          </span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full ml-1 border border-blue-100">
            grassroots
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/athlete-login" className={isActive('/athlete-login')}>Athlete</Link>
          <Link to="/scout-login" className={isActive('/scout-login')}>Scout</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar