import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSupabase } from './supabaseClient.js';

// Import Routes
import studentRoutes from './routes/students.js';
import operativeRoutes from './routes/operatives.js';
import missionRoutes from './routes/missions.js';
import archiveRoutes from './routes/archives.js';
import portfolioRoutes from './routes/portfolio.js';
import mentorRoutes from './routes/mentors.js';
import { getStudentByEmail } from './queries.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
try {
    initSupabase();
    console.log('✅ Supabase Connection Initialized');
} catch (error) {
    console.warn('⚠️ Supabase credentials missing or invalid:', error.message);
}

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Space Portfolio Backend API Running' });
});

// Register Routes
app.use('/api/students', studentRoutes);
app.use('/api/operatives', operativeRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/mentors', mentorRoutes);

// Auth Route (Keeping for now as it's simple)
app.post('/api/login', async (req, res) => {
    const { username, password, role } = req.body;

    if (role === 'mentor' && username === 'admin' && password === 'password123') {
        return res.json({ success: true, user: { username: 'admin', role: 'mentor' } });
    } else if (role === 'student') {
        // Lookup student by email and verify their stored password
        try {
            const emailMatch = username.trim().toLowerCase();
            const student = await getStudentByEmail(emailMatch);

            if (student) {
                const storedPassword = student.password || 'kalvium@123';
                if (password === storedPassword) {
                    return res.json({
                        success: true,
                        user: {
                            username: student.name,
                            role: 'student',
                            studentId: student.id,
                            email: student.email
                        }
                    });
                } else {
                    return res.status(401).json({ success: false, message: 'Invalid credentials' });
                }
            }
        } catch (error) {
            console.error('Login error:', error);
        }

        // Fallback for legacy student login
        if (username === 'student' && password === 'student123') {
            return res.json({ success: true, user: { username: 'student', role: 'student', studentId: 1 } });
        }
    } else if (role === 'visitor') {
        return res.json({ success: true, user: { username: 'visitor', role: 'visitor' } });
    }

    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    // Check if user exists
    try {
        const student = await getStudentByEmail(email);
        if (student) {
            // In a real application, send email with reset link here
            return res.json({ success: true, message: 'Recovery email sent' });
        }
    } catch (error) {
        console.error('Error checking email:', error);
    }
    
    // For security, always return success even if email not found
    return res.json({ success: true, message: 'Recovery email sent' }); 
});

if (!process.env.NETLIFY) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
