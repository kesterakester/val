-- ============================================
-- SAFE QUERIES FOR EMPTY DATABASE
-- These queries work even when you have no data yet
-- ============================================

-- ============================================
-- BASIC CHECKS (Safe for empty DB)
-- ============================================

-- Check if tables exist and are empty
SELECT 
  'user_sessions' as table_name,
  COUNT(*) as row_count
FROM user_sessions
UNION ALL
SELECT 'question_answers', COUNT(*) FROM question_answers
UNION ALL
SELECT 'flames_results', COUNT(*) FROM flames_results
UNION ALL
SELECT 'proposal_interactions', COUNT(*) FROM proposal_interactions
UNION ALL
SELECT 'activity_log', COUNT(*) FROM activity_log;

-- Today's stats (safe for empty DB)
SELECT 
  COALESCE(COUNT(*), 0) as total_sessions,
  COALESCE(COUNT(CASE WHEN final_response = 'YES' THEN 1 END), 0) as yes_count,
  COALESCE(COUNT(CASE WHEN final_response = 'NO' THEN 1 END), 0) as no_count,
  COALESCE(COUNT(CASE WHEN final_response = 'PENDING' THEN 1 END), 0) as pending_count
FROM user_sessions
WHERE DATE(session_start_ist) = CURRENT_DATE;

-- All time stats (safe for empty DB)
SELECT 
  COALESCE(COUNT(*), 0) as total_sessions,
  COALESCE(COUNT(CASE WHEN final_response = 'YES' THEN 1 END), 0) as yes_count,
  COALESCE(COUNT(CASE WHEN final_response = 'NO' THEN 1 END), 0) as no_count
FROM user_sessions;

-- ============================================
-- SIMPLE DATA VIEWS (Safe for empty DB)
-- ============================================

-- View all sessions (returns empty if no data)
SELECT 
  user_name,
  session_start_ist,
  final_response
FROM user_sessions
ORDER BY session_start_ist DESC
LIMIT 10;

-- View all question answers (returns empty if no data)
SELECT 
  qa.question_number,
  qa.answer_text,
  qa.answered_at_ist,
  s.user_name
FROM question_answers qa
JOIN user_sessions s ON qa.session_id = s.id
ORDER BY qa.answered_at_ist DESC
LIMIT 10;

-- View all FLAMES results (returns empty if no data)
SELECT 
  fr.name1,
  fr.name2,
  fr.flames_result,
  fr.love_percentage,
  fr.calculated_at_ist,
  s.user_name
FROM flames_results fr
JOIN user_sessions s ON fr.session_id = s.id
ORDER BY fr.calculated_at_ist DESC
LIMIT 10;

-- ============================================
-- INSERT TEST DATA (Run this to test queries)
-- ============================================

-- Uncomment and run this to add test data:

/*
-- Insert a test session
INSERT INTO user_sessions (user_name, final_response) 
VALUES ('Test User', 'YES');

-- Get the session ID (run this after the insert above)
SELECT id, user_name FROM user_sessions WHERE user_name = 'Test User' ORDER BY session_start_ist DESC LIMIT 1;

-- Insert test question answers (replace 'YOUR_SESSION_ID' with actual ID from above)
INSERT INTO question_answers (session_id, question_number, question_text, answer_text, answer_type)
VALUES 
  ('YOUR_SESSION_ID', 1, 'Test Question 1', 'Test Answer 1', 'text'),
  ('YOUR_SESSION_ID', 2, 'Test Question 2', 'Test Answer 2', 'choice'),
  ('YOUR_SESSION_ID', 3, 'Test Question 3', 'Test Answer 3', 'text');

-- Insert test FLAMES result (replace 'YOUR_SESSION_ID')
INSERT INTO flames_results (session_id, name1, name2, flames_result, love_percentage, love_message)
VALUES ('YOUR_SESSION_ID', 'Alice', 'Bob', 'Love', 85, 'Amazing Connection!');

-- Insert test proposal interactions (replace 'YOUR_SESSION_ID')
INSERT INTO proposal_interactions (session_id, interaction_type, no_attempt_count)
VALUES 
  ('YOUR_SESSION_ID', 'NO', 1),
  ('YOUR_SESSION_ID', 'NO', 2),
  ('YOUR_SESSION_ID', 'YES', 2);
*/

-- ============================================
-- VERIFY TEST DATA
-- ============================================

-- After inserting test data, run these to verify:

-- Check session count
SELECT COUNT(*) as session_count FROM user_sessions;

-- Check question answers count
SELECT COUNT(*) as answers_count FROM question_answers;

-- Check FLAMES results count
SELECT COUNT(*) as flames_count FROM flames_results;

-- Check proposal interactions count
SELECT COUNT(*) as interactions_count FROM proposal_interactions;

-- View complete test session
SELECT 
  s.user_name,
  s.session_start_ist,
  s.final_response,
  COUNT(DISTINCT qa.id) as questions_answered,
  COUNT(DISTINCT fr.id) as flames_played,
  COUNT(DISTINCT pi.id) as total_interactions
FROM user_sessions s
LEFT JOIN question_answers qa ON s.id = qa.session_id
LEFT JOIN flames_results fr ON s.id = fr.session_id
LEFT JOIN proposal_interactions pi ON s.id = pi.session_id
WHERE s.user_name = 'Test User'
GROUP BY s.id, s.user_name, s.session_start_ist, s.final_response;

-- ============================================
-- DELETE TEST DATA (Clean up)
-- ============================================

-- Uncomment to delete test data:
-- DELETE FROM user_sessions WHERE user_name = 'Test User';
-- (This will cascade delete all related data)

-- ============================================
-- SAFE ANALYTICS (Work with any amount of data)
-- ============================================

-- Conversion rate (safe)
SELECT 
  final_response,
  COUNT(*) as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM user_sessions) > 0 
    THEN ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_sessions), 2)
    ELSE 0
  END as percentage
FROM user_sessions
GROUP BY final_response;

-- Most common FLAMES result (safe)
SELECT 
  COALESCE(flames_result, 'No data yet') as flames_result,
  COUNT(*) as count
FROM flames_results
GROUP BY flames_result
ORDER BY count DESC
LIMIT 5;

-- Hourly distribution (safe)
SELECT 
  EXTRACT(HOUR FROM session_start_ist) as hour,
  COUNT(*) as sessions
FROM user_sessions
GROUP BY hour
ORDER BY hour;

-- ============================================
-- QUICK HEALTH CHECK
-- ============================================

-- Run this to see if everything is working
SELECT 
  'Database is ready!' as status,
  (SELECT COUNT(*) FROM user_sessions) as total_sessions,
  (SELECT COUNT(*) FROM question_answers) as total_answers,
  (SELECT COUNT(*) FROM flames_results) as total_flames,
  (SELECT COUNT(*) FROM proposal_interactions) as total_interactions,
  CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' as current_ist_time;
