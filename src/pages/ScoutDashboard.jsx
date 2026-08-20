import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const ScoutDashboard = () => {
  const [scoutProfile, setScoutProfile] = useState({ full_name: '', email: '' });
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('');
  
  // State for the popup modal
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/scout-login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('scouts')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      // ==========================================
      // STRICT SECURITY HACK (Uncomment tomorrow!)
      // if (profileError || !profile) {
      //   await supabase.auth.signOut();
      //   navigate('/scout-login');
      //   return;
      // }
      // ==========================================

      if (profile) {
        setScoutProfile(profile);
      } else {
        setScoutProfile({ full_name: 'Hackathon Scout', email: user.email });
      }

      const { data: athletesData } = await supabase
        .from('athletes')
        .select(`
          *,
          test_results (
            performance_score,
            test_name,
            assessment_date
          )
        `)
        .order('created_at', { ascending: false });

      setAthletes(athletesData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const availableLocations = useMemo(() => {
    return [...new Set(athletes.map(a => a.district).filter(Boolean))].sort();
  }, [athletes]);

  const availableAges = useMemo(() => {
    return [...new Set(athletes.map(a => a.age).filter(Boolean))].sort((a, b) => a - b);
  }, [athletes]);

  const processedAthletes = useMemo(() => {
    let results = [...athletes];
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      results = results.filter(a =>
        a.full_name?.toLowerCase().includes(query) ||
        a.sports?.some(s => s.toLowerCase().includes(query))
      );
    }
    if (filterAge) results = results.filter(a => a.age?.toString() === filterAge);
    if (filterLocation) results = results.filter(a => a.district === filterLocation);
    if (sortBy) {
      results.sort((a, b) => {
        const scoreA = a.test_results?.[0]?.performance_score || 0;
        const scoreB = b.test_results?.[0]?.performance_score || 0;
        if (sortBy === 'score_high') return scoreB - scoreA;
        if (sortBy === 'score_low') return scoreA - scoreB;
        return 0;
      });
    }
    return results;
  }, [athletes, searchTerm, filterAge, filterLocation, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scout portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 p-4 md:p-6 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Dynamic Scout Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
                <i className="fas fa-user text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {scoutProfile.full_name || 'Scout User'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {scoutProfile.email || 'Loading email...'}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition font-medium">
              Sign Out
            </button>
          </div>
        </div>

        {/* Merged Athlete Discovery Portal & Filters */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 mb-8 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-200/50">
                <i className="fas fa-search text-2xl text-indigo-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-950">Athlete Discovery Portal</h3>
                <p className="text-indigo-600/80 text-sm font-medium mt-0.5">
                  Showing {processedAthletes.length} analyzed athletes
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setFilterAge(''); setFilterLocation(''); setSortBy(''); setSearchTerm(''); }}
              className="px-5 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl transition text-sm font-semibold shadow-sm whitespace-nowrap flex items-center gap-2"
            >
              <i className="fas fa-times opacity-70"></i> Clear Filters
            </button>
          </div>

          <div className="relative">
            <i className="fas fa-search absolute left-4 top-3.5 text-indigo-400"></i>
            <input
              type="text"
              placeholder="Search athletes by name or sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-indigo-900 placeholder-indigo-300"
            />
          </div>
          
          {/* Dropdown Filters Row */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl text-sm text-indigo-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-max"
            >
              <option value="">Sort by Performance</option>
              <option value="score_high">Highest Score First</option>
              <option value="score_low">Lowest Score First</option>
            </select>

            <select 
              value={filterLocation} 
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl text-sm text-indigo-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-max"
            >
              <option value="">All Locations</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <select 
              value={filterAge} 
              onChange={(e) => setFilterAge(e.target.value)}
              className="px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl text-sm text-indigo-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-max"
            >
              <option value="">All Ages</option>
              {availableAges.map(age => (
                <option key={age} value={age.toString()}>{age} yrs</option>
              ))}
            </select>
          </div>
        </div>

        {/* Athletes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedAthletes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
              <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">No athletes found matching your filters</p>
            </div>
          ) : (
            processedAthletes.map((athlete) => {
              const latestScore = athlete.test_results?.[0]?.performance_score || '—';
              return (
                <div key={athlete.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{athlete.full_name}</h3>
                      <p className="text-sm text-gray-500">{athlete.sports?.[0] || 'No sport'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${latestScore !== '—' && latestScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      Score: {latestScore}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500 font-medium">
                    <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <i className="fas fa-calendar mr-1 text-slate-400"></i> {athlete.age || 'N/A'} yrs
                    </span>
                    <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <i className="fas fa-map-marker-alt mr-1 text-slate-400"></i> {athlete.district || 'N/A'}
                    </span>
                    <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <i className="fas fa-tag mr-1 text-slate-400"></i> {athlete.gender || 'N/A'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedAthlete(athlete)}
                    className="mt-5 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition"
                  >
                    View Profile
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Athlete Profile Modal Popup */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedAthlete.full_name}</h2>
                <p className="text-indigo-600 font-medium mt-1">
                  <i className="fas fa-running mr-1.5"></i> 
                  {selectedAthlete.sports?.[0] || 'No sport specified'}
                </p>
              </div>
              <button
                onClick={() => setSelectedAthlete(null)}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Age</p>
                  <p className="text-gray-900 font-medium mt-1">{selectedAthlete.age || 'N/A'} years</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Gender</p>
                  <p className="text-gray-900 font-medium mt-1 capitalize">{selectedAthlete.gender || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Location</p>
                  <p className="text-gray-900 font-medium mt-1">{selectedAthlete.district || 'N/A'}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">AI Assessment Score</p>
                  <p className="text-indigo-900 font-bold mt-1 text-lg">
                    {selectedAthlete.test_results?.[0]?.performance_score || 'Pending'}
                  </p>
                </div>
              </div>

              {/* Placeholder for future detailed analytics integration */}
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center">
                <i className="fas fa-chart-line text-slate-400 text-3xl mb-2"></i>
                <p className="text-sm text-slate-600 font-medium">Detailed Analytics</p>
                <p className="text-xs text-slate-400 mt-1">Full performance charts and video replays will be available here.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAthlete(null)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl font-medium transition text-sm"
              >
                Close
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm">
                View Full Profile <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutDashboard;