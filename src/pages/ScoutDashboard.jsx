import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const ScoutDashboard = () => {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/scout-login');
        return;
      }

      const { data } = await supabase
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

      setAthletes(data || []);
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

  const filteredAthletes = athletes.filter(athlete =>
    athlete.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.sports?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading athletes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scout Dashboard</h1>
              <p className="text-gray-500">Discover and evaluate grassroots talent</p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-3 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search athletes by name or sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Athlete Discovery Portal */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3 rounded-xl">
              <i className="fas fa-search text-2xl text-indigo-600"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-indigo-800">Athlete Discovery Portal</h3>
              <p className="text-indigo-600/80 text-sm">
                Performance-based athlete discovery and scouting
              </p>
            </div>
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-medium">
              Advanced Search
            </button>
          </div>
        </div>

        {/* Athletes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
              <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">No athletes found</p>
            </div>
          ) : (
            filteredAthletes.map((athlete) => {
              const latestScore = athlete.test_results?.[0]?.performance_score || '—';
              return (
                <div key={athlete.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{athlete.full_name}</h3>
                      <p className="text-sm text-gray-500">
                        {athlete.sports?.[0] || 'No sport'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      latestScore !== '—' && latestScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      Score: {latestScore}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-500">
                    <span><i className="fas fa-calendar mr-1"></i> {athlete.age || 'N/A'} yrs</span>
                    <span><i className="fas fa-map-marker-alt mr-1"></i> {athlete.district || 'N/A'}</span>
                    <span><i className="fas fa-tag mr-1"></i> {athlete.gender || 'N/A'}</span>
                  </div>
                  <button className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition">
                    View Profile
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoutDashboard;