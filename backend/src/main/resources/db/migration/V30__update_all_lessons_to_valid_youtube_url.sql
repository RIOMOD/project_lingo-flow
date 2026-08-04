-- V30__update_all_lessons_to_valid_youtube_url.sql
-- Update all lesson video URLs to valid YouTube video URL provided by user

UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=PC1UA04O-TQ';
