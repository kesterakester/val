-- ============================================
-- VALENTINE APP - COMMON ANALYTICS QUERIES
-- Quick reference for analyzing user activity
-- ============================================

-- ============================================
-- DAILY STATISTICS
-- ============================================

-- Today's activity summary (IST)
SELECT 
  COALESCE(COUNT(*), 0) as total_sessions,
  COALESCE(COUNT(CASE WHEN final_response = 'YES' THEN 1 END), 0) as yes_responses,
  COALESCE(COUNT(CASE WHEN final_response = 'NO' THEN 1 END), 0) as no_responses,
  COALESCE(COUNT(CASE WHEN final_response = 'PENDING' THEN 1 END), 0) as pending,
  COALESCE(ROUND(COUNT(CASE WHEN final_response = 'YES' THEN 1 END)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as yes_percentage
FROM user_sessions
WHERE DATE(session_start_ist) = CURRENT_DATE;

-- Last 7 days trend
SELECT 
  DATE(session_start_ist) as date,
  COALESCE(COUNT(*), 0) as sessions,
  COALESCE(COUNT(CASE WHEN final_response = 'YES' THEN 1 END), 0) as yes_count,
  COALESCE(ROUND(COUNT(CASE WHEN final_response = 'YES' THEN 1 END)::numeric * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as conversion_rate
FROM user_sessions
WHERE session_start_ist >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(session_start_ist)
ORDER BY date DESC;

-- ============================================
-- USER BEHAVIOR ANALYSIS
-- ============================================

-- Most persistent users (most "No" clicks before saying "Yes")
SELECT 
  s.user_name,
  s.session_start_ist,
  COUNT(pi.id) as no_clicks,
  s.final_response
FROM user_sessions s
LEFT JOIN proposal_interactions pi ON s.id = pi.session_id AND pi.interaction_type = 'NO'
WHERE s.final_response = 'YES'
GROUP BY s.id, s.user_name, s.session_start_ist, s.final_response
ORDER BY no_clicks DESC
LIMIT 20;

-- Average "No" clicks before saying "Yes"
SELECT 
  ROUND(AVG(no_click_count), 2) as avg_no_clicks_before_yes
FROM (
  SELECT 
    s.id,
    COUNT(pi.id) as no_click_count
  FROM user_sessions s
  LEFT JOIN proposal_interactions pi ON s.id = pi.session_id AND pi.interaction_type = 'NO'
  WHERE s.final_response = 'YES'
  GROUP BY s.id
) subquery;

-- Users who gave up (clicked "No" many times but didn't say "Yes")
SELECT 
  s.user_name,
  s.session_start_ist,
  COUNT(pi.id) as no_clicks,
  s.final_response
FROM user_sessions s
LEFT JOIN proposal_interactions pi ON s.id = pi.session_id AND pi.interaction_type = 'NO'
WHERE s.final_response != 'YES'
GROUP BY s.id, s.user_name, s.session_start_ist, s.final_response
HAVING COUNT(pi.id) > 0
ORDER BY no_clicks DESC;

-- ============================================
-- QUESTION ANALYSIS
-- ============================================

-- Most popular answers for each question
SELECT 
  question_number,
  question_text,
  answer_text,
  COUNT(*) as frequency,
  COALESCE(ROUND(COUNT(*)::numeric * 100.0 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY question_number), 0), 2), 0) as percentage
FROM question_answers
GROUP BY question_number, question_text, answer_text
ORDER BY question_number, frequency DESC;

-- Most common answer to "describe our connection in one word"
SELECT 
  answer_text,
  COUNT(*) as count
FROM question_answers
WHERE question_number = 1
GROUP BY answer_text
ORDER BY count DESC
LIMIT 20;

-- Most popular romantic setting choice
SELECT 
  answer_text,
  COUNT(*) as count,
  COALESCE(ROUND(COUNT(*)::numeric * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2), 0) as percentage
FROM question_answers
WHERE question_number = 2
GROUP BY answer_text
ORDER BY count DESC;

-- ============================================
-- FLAMES & LOVE CALCULATOR ANALYSIS
-- ============================================

-- Most common FLAMES results
SELECT 
  flames_result,
  COUNT(*) as count,
  ROUND(AVG(love_percentage), 2) as avg_love_percentage,
  MIN(love_percentage) as min_percentage,
  MAX(love_percentage) as max_percentage
FROM flames_results
GROUP BY flames_result
ORDER BY count DESC;

-- Distribution of love percentages
SELECT 
  CASE 
    WHEN love_percentage >= 90 THEN '90-100%'
    WHEN love_percentage >= 80 THEN '80-89%'
    WHEN love_percentage >= 70 THEN '70-79%'
    WHEN love_percentage >= 60 THEN '60-69%'
    ELSE '50-59%'
  END as percentage_range,
  COUNT(*) as count
FROM flames_results
GROUP BY percentage_range
ORDER BY percentage_range DESC;

-- Users who got "Soulmates" in FLAMES
SELECT 
  s.user_name,
  fr.name1,
  fr.name2,
  fr.love_percentage,
  fr.calculated_at_ist
FROM flames_results fr
JOIN user_sessions s ON fr.session_id = s.id
WHERE fr.flames_result = 'Soulmates'
ORDER BY fr.calculated_at_ist DESC;

-- ============================================
-- TIME-BASED ANALYSIS
-- ============================================

-- Hourly activity distribution (IST)
SELECT 
  EXTRACT(HOUR FROM session_start_ist) as hour,
  COUNT(*) as sessions,
  COALESCE(ROUND(COUNT(*)::numeric * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2), 0) as percentage
FROM user_sessions
GROUP BY hour
ORDER BY hour;

-- Peak activity hours
SELECT 
  EXTRACT(HOUR FROM session_start_ist) as hour,
  COUNT(*) as sessions
FROM user_sessions
GROUP BY hour
ORDER BY sessions DESC
LIMIT 5;

-- Day of week analysis
SELECT 
  TO_CHAR(session_start_ist, 'Day') as day_of_week,
  COUNT(*) as sessions,
  COUNT(CASE WHEN final_response = 'YES' THEN 1 END) as yes_count
FROM user_sessions
GROUP BY TO_CHAR(session_start_ist, 'Day'), EXTRACT(DOW FROM session_start_ist)
ORDER BY EXTRACT(DOW FROM session_start_ist);

-- ============================================
-- COMPLETION FUNNEL
-- ============================================

-- User journey completion rates
SELECT 
  'Started' as stage,
  COUNT(*) as users,
  100.0 as percentage
FROM user_sessions
UNION ALL
SELECT 
  'Answered Questions',
  COUNT(DISTINCT session_id),
  COALESCE(ROUND(COUNT(DISTINCT session_id)::numeric * 100.0 / NULLIF((SELECT COUNT(*) FROM user_sessions), 0), 2), 0)
FROM question_answers
UNION ALL
SELECT 
  'Played FLAMES',
  COUNT(DISTINCT session_id),
  COALESCE(ROUND(COUNT(DISTINCT session_id)::numeric * 100.0 / NULLIF((SELECT COUNT(*) FROM user_sessions), 0), 2), 0)
FROM flames_results
UNION ALL
SELECT 
  'Reached Proposal',
  COUNT(DISTINCT session_id),
  COALESCE(ROUND(COUNT(DISTINCT session_id)::numeric * 100.0 / NULLIF((SELECT COUNT(*) FROM user_sessions), 0), 2), 0)
FROM proposal_interactions
UNION ALL
SELECT 
  'Said Yes',
  COUNT(*),
  COALESCE(ROUND(COUNT(*)::numeric * 100.0 / NULLIF((SELECT COUNT(*) FROM user_sessions), 0), 2), 0)
FROM user_sessions
WHERE final_response = 'YES';

-- ============================================
-- RECENT ACTIVITY
-- ============================================

-- Last 10 sessions with full details
SELECT 
  s.user_name,
  s.session_start_ist,
  s.final_response,
  COUNT(DISTINCT qa.id) as questions_answered,
  fr.flames_result,
  fr.love_percentage,
  COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'NO') as no_clicks
FROM user_sessions s
LEFT JOIN question_answers qa ON s.id = qa.session_id
LEFT JOIN flames_results fr ON s.id = fr.session_id
LEFT JOIN proposal_interactions pi ON s.id = pi.session_id
GROUP BY s.id, s.user_name, s.session_start_ist, s.final_response, fr.flames_result, fr.love_percentage
ORDER BY s.session_start_ist DESC
LIMIT 10;

-- ============================================
-- ENGAGEMENT METRICS
-- ============================================

-- Average time spent (based on first and last activity)
SELECT 
  AVG(EXTRACT(EPOCH FROM (last_activity - first_activity))) / 60 as avg_minutes_spent
FROM (
  SELECT 
    s.id,
    s.session_start_ist as first_activity,
    GREATEST(
      COALESCE(MAX(qa.answered_at_ist), s.session_start_ist),
      COALESCE(MAX(fr.calculated_at_ist), s.session_start_ist),
      COALESCE(MAX(pi.interacted_at_ist), s.session_start_ist)
    ) as last_activity
  FROM user_sessions s
  LEFT JOIN question_answers qa ON s.id = qa.session_id
  LEFT JOIN flames_results fr ON s.id = fr.session_id
  LEFT JOIN proposal_interactions pi ON s.id = pi.session_id
  GROUP BY s.id, s.session_start_ist
) activity_times
WHERE EXTRACT(EPOCH FROM (last_activity - first_activity)) > 0;

-- ============================================
-- EXPORT QUERIES
-- ============================================

-- Export all user data (for backup or analysis)
SELECT 
  s.user_name,
  s.session_start_ist,
  s.final_response,
  (
    SELECT json_agg(jsonb_build_object(
      'question', qa2.question_number,
      'answer', qa2.answer_text
    ) ORDER BY qa2.question_number)
    FROM question_answers qa2
    WHERE qa2.session_id = s.id
  ) as answers,
  (
    SELECT json_agg(jsonb_build_object(
      'flames_result', fr2.flames_result,
      'love_percentage', fr2.love_percentage,
      'name1', fr2.name1,
      'name2', fr2.name2
    ))
    FROM flames_results fr2
    WHERE fr2.session_id = s.id
  ) as flames_data,
  COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'NO') as total_no_clicks
FROM user_sessions s
LEFT JOIN question_answers qa ON s.id = qa.session_id
LEFT JOIN flames_results fr ON s.id = fr.session_id
LEFT JOIN proposal_interactions pi ON s.id = pi.session_id
GROUP BY s.id, s.user_name, s.session_start_ist, s.final_response
ORDER BY s.session_start_ist DESC;

-- ============================================
-- CLEANUP QUERIES (USE WITH CAUTION!)
-- ============================================

-- Delete test sessions (uncomment to use)
-- DELETE FROM user_sessions WHERE user_name LIKE '%test%' OR user_name LIKE '%Test%';

-- Delete sessions older than 30 days (uncomment to use)
-- DELETE FROM user_sessions WHERE session_start_ist < CURRENT_DATE - INTERVAL '30 days';

-- Delete incomplete sessions (no final response after 24 hours)
-- DELETE FROM user_sessions 
-- WHERE final_response = 'PENDING' 
-- AND session_start_ist < NOW() - INTERVAL '24 hours';
