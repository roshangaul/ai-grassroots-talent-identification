import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const AthleteDashboard = () => {
  const [athlete, setAthlete] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAthleteData();
  }, []);

  const fetchAthleteData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/athlete-login');
        return;
      }

      const { data: athleteData } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', user.id)
        .single();

      setAthlete(athleteData);

      const { data: testData } = await supabase
        .from('test_results')
        .select(`
          *,
          test_sessions (
            test_name,
            test_date,
            status
          )
        `)
        .eq('athlete_id', user.id)
        .order('assessment_date', { ascending: false });

      setTests(testData || []);
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

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadMessage('❌ Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadMessage('❌ Video must be less than 50MB');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('athlete-videos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('athlete-videos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('athletes')
        .update({ 
          video_urls: [...(athlete?.video_urls || []), urlData.publicUrl]
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUploadMessage('✅ Video uploaded successfully!');
      fetchAthleteData();

      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage('');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-4 rounded-2xl text-white">
                <i className="fas fa-user text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {athlete?.full_name || 'Athlete'}
                </h1>
                <p className="text-gray-500">{athlete?.email}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {athlete?.sports?.[0] || 'No sport'}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {athlete?.age || 'N/A'} years
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500">Avg Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {tests.length > 0 
                ? Math.round(tests.reduce((sum, t) => sum + (t.performance_score || 0), 0) / tests.length)
                : '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500">Best Score</p>
            <p className="text-2xl font-bold text-green-600">
              {tests.length > 0 
                ? Math.max(...tests.map(t => t.performance_score || 0))
                : '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-sm font-medium text-blue-600">
              {tests.filter(t => t.test_sessions?.status === 'completed').length} Completed
            </p>
          </div>
        </div>

        {/* AI Video Analysis Module */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <i className="fas fa-video text-2xl text-blue-600"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-800">AI Video Analysis Module</h3>
              <p className="text-blue-600/80 text-sm">
                Upload your performance videos for AI-powered assessment
              </p>
              {athlete?.video_urls && athlete.video_urls.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ {athlete.video_urls.length} video(s) uploaded
                </p>
              )}
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-sm font-medium"
            >
              {athlete?.video_urls?.length > 0 ? 'Upload Another' : 'Upload Video'}
            </button>
          </div>
          {athlete?.video_urls && athlete.video_urls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {athlete.video_urls.map((url, index) => (
                <a 
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white px-3 py-1 rounded-full text-blue-600 hover:bg-blue-50 transition"
                >
                  📹 Video {index + 1}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!uploading) {
                setShowUploadModal(false);
                setUploadMessage('');
              }
            }}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button - Top Right */}
              <button 
                onClick={() => {
                  if (!uploading) {
                    setShowUploadModal(false);
                    setUploadMessage('');
                  }
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                type="button"
                disabled={uploading}
              >
                ×
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Performance Video</h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition relative">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-600 text-sm mb-2">Click to select or drag & drop</p>
                <p className="text-xs text-gray-400">MP4, WebM, MOV (Max 50MB)</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Upload Message */}
              {uploadMessage && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${
                  uploadMessage.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 
                  uploadMessage.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {uploadMessage}
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">Uploading...</p>
                </div>
              )}

              {/* Close Button - Bottom */}
              <button
                onClick={() => {
                  if (!uploading) {
                    setShowUploadModal(false);
                    setUploadMessage('');
                  }
                }}
                className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition text-sm font-medium"
                type="button"
                disabled={uploading}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Test History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Test History</h3>
            <span className="text-sm text-gray-500">{tests.length} tests</span>
          </div>
          <div className="overflow-x-auto">
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">No test results yet</p>
                <p className="text-sm text-gray-400 mt-1">Complete your first assessment</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {test.test_name?.replace(/([A-Z])/g, ' $1').trim() || 'Custom'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(test.assessment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${test.performance_score >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {test.performance_score || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          test.test_sessions?.status === 'completed' ? 'bg-green-100 text-green-700' :
                          test.test_sessions?.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {test.test_sessions?.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard;