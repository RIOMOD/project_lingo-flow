-- V27: Clear phantom vocabulary_progress records that were auto-created
-- by the old recordVocabularyProgress method (which incorrectly grabbed
-- random vocabulary rows and marked them as MASTERED regardless of user study).
-- After this migration, dueReviewWords will correctly return 0 for users
-- who haven't explicitly studied any vocabulary words yet.

DELETE FROM vocabulary_progress
WHERE next_review_at IS NOT NULL
  AND reviewed_at IS NOT NULL
  -- Only remove records where mastery_score = 100 set by bulk (phantom), 
  -- but user has 0 or null total session events tied to actual study
  -- (i.e., records that were bulk-inserted, not incrementally earned).
  -- We identify phantom records as those where:
  --   correct_count = 1 (only ever "answered correctly" once, via bulk insert)
  --   AND mastery_score = 100 (instantly set to 100 by the old method)
  AND correct_count = 1
  AND mastery_score = 100;
