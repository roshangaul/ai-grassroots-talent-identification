import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// ✅ Load environment variables from server/.env
dotenv.config({ path: './server/.env' });
// Fallback to root .env
dotenv.config();

// ✅ Debug: Check if env vars are loaded
console.log('🔍 Checking environment variables...');
console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase Client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ============ API Routes ============

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 2. Process video with AI
app.post('/api/video/process', async (req, res) => {
  try {
    const { athlete_id, video_url } = req.body;
    
    if (!athlete_id || !video_url) {
      return res.status(400).json({ error: 'Missing athlete_id or video_url' });
    }

    // Create processing job
    const { data: job, error } = await supabase
      .from('processing_jobs')
      .insert({
        athlete_id,
        video_url,
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Call Python AI service (non-blocking)
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    
    fetch(`${pythonServiceUrl}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: job.id,
        athlete_id,
        video_url
      })
    }).catch(err => console.error('AI Service error:', err));

    res.json({
      success: true,
      job_id: job.id,
      message: 'Processing started'
    });

  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get processing status
app.get('/api/processing/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;
    
    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (error) throw error;

    // If completed, fetch metrics
    let metrics = null;
    if (data.status === 'completed') {
      const { data: testData } = await supabase
        .from('test_results')
        .select('metrics')
        .eq('athlete_id', data.athlete_id)
        .order('assessment_date', { ascending: false })
        .limit(1);
      
      metrics = testData?.[0]?.metrics || null;
    }

    res.json({ ...data, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get athlete AI metrics
app.get('/api/athlete/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('athlete_id', id)
      .order('assessment_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get scout recommendations
app.get('/api/scout/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    const response = await fetch(`${pythonServiceUrl}/recommendations/${id}?limit=${limit}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Connect scout with athlete
app.post('/api/connect', async (req, res) => {
  try {
    const { scout_id, athlete_id, message } = req.body;

    const { data, error } = await supabase
      .from('athlete_connections')
      .insert({
        scout_id,
        athlete_id,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Send message
app.post('/api/messages', async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id, receiver_id, content })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Get messages
app.get('/api/messages/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { sport, limit = 20 } = req.query;
    
    let query = supabase
      .from('rankings')
      .select(`
        *,
        athletes (
          full_name,
          sport,
          age,
          skill_level
        )
      `)
      .order('rank', { ascending: true })
      .limit(limit);

    if (sport) {
      query = query.eq('sport', sport);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Get public athlete profile
app.get('/api/athlete/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', id)
      .single();

    if (athleteError) throw athleteError;

    const { data: metrics, error: metricsError } = await supabase
      .from('test_results')
      .select('*')
      .eq('athlete_id', id)
      .order('assessment_date', { ascending: false })
      .limit(5);

    if (metricsError) throw metricsError;

    const { data: rank, error: rankError } = await supabase
      .from('rankings')
      .select('rank')
      .eq('athlete_id', id)
      .single();

    res.json({
      athlete,
      metrics,
      rank: rank?.rank || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});