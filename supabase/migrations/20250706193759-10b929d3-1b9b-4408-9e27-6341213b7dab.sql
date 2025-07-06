UPDATE system_knowledge_base 
SET content = 'Provide concise, actionable responses. Default to 1-2 sentences for most questions. Use bullet points for lists or multiple items. If a response absolutely requires more detail, use up to 4 sentences maximum. Avoid lengthy explanations unless user explicitly requests detailed information. Focus on practical, immediately useful information.',
    updated_at = now()
WHERE title = 'Response Length Guidelines' AND category = 'ai_behavior';