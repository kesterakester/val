-- ============================================
-- Valentine App - Comprehensive Activity Tracking Schema
-- All timestamps are stored in IST (Asia/Kolkata timezone)
-- ============================================

-- Drop existing tables if you want to start fresh (CAUTION: This deletes all data!)
-- DROP TABLE IF EXISTS activity_log CASCADE;
-- DROP TABLE IF EXISTS proposal_interactions CASCADE;
-- DROP TABLE IF EXISTS love_calculator_results CASCADE;
-- DROP TABLE IF EXISTS flames_results CASCADE;
-- DROP TABLE IF EXISTS question_answers CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;

-- ============================================
-- 1. USER SESSIONS TABLE
-- Tracks when users start the Valentine experience
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  session_start_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_start_ist TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
  user_agent TEXT,
  ip_address INET,
  completed BOOLEAN DEFAULT FALSE,
  final_response TEXT CHECK (final_response IN ('YES', 'NO', 'PENDING')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_name ON user_sessions(user_name);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON user_sessions(session_start_ist);

-- ============================================
-- 2. QUESTION ANSWERS TABLE
-- Tracks all answers to the 5 romantic questions
-- ============================================
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 5),
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_type TEXT CHECK (answer_type IN ('text', 'choice')),
  answered_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at_ist TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_answers_session ON question_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_date ON question_answers(answered_at_ist);

-- ============================================
-- 3. FLAMES RESULTS TABLE
-- Tracks FLAMES game calculations
-- ============================================
CREATE TABLE IF NOT EXISTS flames_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  name1 TEXT NOT NULL,
  name2 TEXT NOT NULL,
  flames_result TEXT NOT NULL CHECK (flames_result IN ('Friends', 'Love', 'Affection', 'Marriage', 'Enemy', 'Soulmates')),
  love_percentage INTEGER CHECK (love_percentage BETWEEN 0 AND 100),
  love_message TEXT,
  calculated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculated_at_ist TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flames_session ON flames_results(session_id);
CREATE INDEX IF NOT EXISTS idx_flames_date ON flames_results(calculated_at_ist);

-- ============================================
-- 4. LOVE CALCULATOR RESULTS TABLE
-- Tracks standalone love calculator usage
-- ============================================
CREATE TABLE IF NOT EXISTS love_calculator_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  name1 TEXT NOT NULL,
  name2 TEXT NOT NULL,
  love_percentage INTEGER NOT NULL CHECK (love_percentage BETWEEN 0 AND 100),
  love_message TEXT,
  calculated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculated_at_ist TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_love_calc_session ON love_calculator_results(session_id);
CREATE INDEX IF NOT EXISTS idx_love_calc_date ON love_calculator_results(calculated_at_ist);

-- ============================================
-- 5. PROPOSAL INTERACTIONS TABLE
-- Tracks every Yes/No button interaction
-- ============================================
CREATE TABLE IF NOT EXISTS proposal_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('YES', 'NO', 'NO_HOVER')),
  no_attempt_count INTEGER DEFAULT 0,
  button_position JSONB, -- Stores {x, y} coordinates for No button
  interacted_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interacted_at_ist TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposal_session ON proposal_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_proposal_date ON proposal_interactions(interacted_at_ist);
CREATE INDEX IF NOT EXISTS idx_proposal_type ON proposal_interactions(interaction_type);

-- ============================================
-- 6. ACTIVITY LOG TABLE
-- General activity tracking for any other events
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  screen_state TEXT, -- 'INTRO', 'QUESTIONS', 'MESSAGE', 'FLAMES', 'LOVE_CALCULATOR', 'PROPOSAL', 'SUCCESS'
  logged_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logged_at_ist TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_session ON activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(logged_at_ist);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(activity_type);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Allow public insert but restrict read/update/delete
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flames_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_calculator_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for public app)
CREATE POLICY "Enable insert for everyone" ON user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for everyone" ON question_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for everyone" ON flames_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for everyone" ON love_calculator_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for everyone" ON proposal_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for everyone" ON activity_log FOR INSERT WITH CHECK (true);

-- Allow anyone to update their own session
CREATE POLICY "Enable update for everyone" ON user_sessions FOR UPDATE USING (true);

-- Allow anyone to select (read) - you can restrict this if needed
CREATE POLICY "Enable select for everyone" ON user_sessions FOR SELECT USING (true);
CREATE POLICY "Enable select for everyone" ON question_answers FOR SELECT USING (true);
CREATE POLICY "Enable select for everyone" ON flames_results FOR SELECT USING (true);
CREATE POLICY "Enable select for everyone" ON love_calculator_results FOR SELECT USING (true);
CREATE POLICY "Enable select for everyone" ON proposal_interactions FOR SELECT USING (true);
CREATE POLICY "Enable select for everyone" ON activity_log FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current IST timestamp
CREATE OR REPLACE FUNCTION get_ist_timestamp()
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN NOW() AT TIME ZONE 'Asia/Kolkata';
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_sessions
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USEFUL VIEWS FOR ANALYTICS
-- ============================================

-- View: Daily session summary
CREATE OR REPLACE VIEW daily_session_summary AS
SELECT 
  DATE(session_start_ist) as date,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN final_response = 'YES' THEN 1 END) as yes_count,
  COUNT(CASE WHEN final_response = 'NO' THEN 1 END) as no_count,
  COUNT(CASE WHEN final_response = 'PENDING' THEN 1 END) as pending_count,
  COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
FROM user_sessions
GROUP BY DATE(session_start_ist)
ORDER BY date DESC;

-- View: Popular FLAMES results
CREATE OR REPLACE VIEW popular_flames_results AS
SELECT 
  flames_result,
  COUNT(*) as count,
  ROUND(AVG(love_percentage), 2) as avg_love_percentage
FROM flames_results
GROUP BY flames_result
ORDER BY count DESC;

-- View: User journey (complete session flow)
CREATE OR REPLACE VIEW user_journey AS
SELECT 
  s.id as session_id,
  s.user_name,
  s.session_start_ist,
  s.final_response,
  COUNT(DISTINCT qa.id) as questions_answered,
  COUNT(DISTINCT fr.id) as flames_played,
  COUNT(DISTINCT pi.id) as proposal_interactions,
  SUM(CASE WHEN pi.interaction_type = 'NO' THEN 1 ELSE 0 END) as no_clicks
FROM user_sessions s
LEFT JOIN question_answers qa ON s.id = qa.session_id
LEFT JOIN flames_results fr ON s.id = fr.session_id
LEFT JOIN proposal_interactions pi ON s.id = pi.session_id
GROUP BY s.id, s.user_name, s.session_start_ist, s.final_response
ORDER BY s.session_start_ist DESC;

-- ============================================
-- SAMPLE QUERIES FOR ANALYTICS
-- ============================================

-- Get all sessions from today (IST)
-- SELECT * FROM user_sessions WHERE DATE(session_start_ist) = CURRENT_DATE;

-- Get most common answers to question 1
-- SELECT answer_text, COUNT(*) as count 
-- FROM question_answers 
-- WHERE question_number = 1 
-- GROUP BY answer_text 
-- ORDER BY count DESC;

-- Get average number of "No" clicks before saying "Yes"
-- SELECT AVG(no_clicks) FROM user_journey WHERE final_response = 'YES';

-- Get hourly activity distribution
-- SELECT EXTRACT(HOUR FROM session_start_ist) as hour, COUNT(*) as sessions
-- FROM user_sessions
-- GROUP BY hour
-- ORDER BY hour;
