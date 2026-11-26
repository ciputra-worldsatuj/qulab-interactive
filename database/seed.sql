-- ==============================================================
-- QuLab Default Seed Data
-- Reference: FR-AUTH-02 (Akun awal dosen: username=dosen, password=admin123)
-- Hash bcrypt untuk 'admin123': $2a$10$3zI1O7K0MvN5L9KqR/bFGeZ6Z1WjKkE7F5E4E3E2E1E0E9E8E7E6E
-- ==============================================================

USE qulab;

INSERT INTO dosen (username, password_hash)
SELECT 'dosen', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE NOT EXISTS (SELECT 1 FROM dosen WHERE username = 'dosen');
