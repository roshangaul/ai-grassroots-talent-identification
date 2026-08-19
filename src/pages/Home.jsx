import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20 px-4 rounded-b-[3rem] shadow-xl">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            AI-Based Grassroots <br className="hidden sm:block" />
            Talent Identification
          </h1>
          <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto mt-4">
            Helping talented athletes get discovered through objective performance
            assessment and data-driven scouting.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              to="/athlete-register"
              className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <i className="fas fa-user-plus"></i> Register as Athlete
            </Link>
            <Link
              to="/athlete-login"
              className="bg-transparent border-2 border-white/80 text-white hover:bg-white/10 px-6 py-3 rounded-full font-semibold transition flex items-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i> Login as Athlete
            </Link>
            <Link
              to="/scout-register"
              className="bg-indigo-400 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-indigo-500 transition flex items-center gap-2"
            >
              <i className="fas fa-user-tie"></i> Register as Scout
            </Link>
            <Link
              to="/scout-login"
              className="bg-transparent border-2 border-white/80 text-white hover:bg-white/10 px-6 py-3 rounded-full font-semibold transition flex items-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i> Login as Scout
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-7 rounded-3xl card-shadow border border-gray-100 hover:shadow-xl transition">
          <div className="feature-icon w-fit">
            <i className="fas fa-video text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mt-4">AI Video Analysis</h3>
          <p className="text-gray-500 text-sm">
            Sprint & vertical jump assessment using computer vision — future capability.
          </p>
        </div>
        <div className="bg-white p-7 rounded-3xl card-shadow border border-gray-100 hover:shadow-xl transition">
          <div className="feature-icon w-fit">
            <i className="fas fa-chart-line text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mt-4">Talent Discovery</h3>
          <p className="text-gray-500 text-sm">
            Objective athlete profiling with performance metrics & AI-driven scores.
          </p>
        </div>
        <div className="bg-white p-7 rounded-3xl card-shadow border border-gray-100 hover:shadow-xl transition">
          <div className="feature-icon w-fit">
            <i className="fas fa-users text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mt-4">Scout Search Portal</h3>
          <p className="text-gray-500 text-sm">
            Performance-based athlete discovery for scouts and organizations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home