-- Update demo accounts with valid BCrypt hash for Password123!

UPDATE users 
SET password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkq8yV5h4Z.6e6X9u6.8Sg.H.N1O2' 
WHERE email IN ('admin@example.com', 'teacher@example.com', 'student@example.com', 'student2@example.com', 'teacher2@example.com');
