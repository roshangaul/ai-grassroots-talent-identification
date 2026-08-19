import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AthleteLogin from './pages/AthleteLogin';
import AthleteRegister from './pages/AthleteRegister';
import ScoutLogin from './pages/ScoutLogin';
import ScoutRegister from './pages/ScoutRegister';
import AthleteDashboard from './pages/AthleteDashboard';
import ScoutDashboard from './pages/ScoutDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/athlete-register" element={<AthleteRegister />} />
            <Route path="/athlete-login" element={<AthleteLogin />} />
            <Route path="/scout-register" element={<ScoutRegister />} />
            <Route path="/scout-login" element={<ScoutLogin />} />
            <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
            <Route path="/scout-dashboard" element={<ScoutDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;