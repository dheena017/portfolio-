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
import { getStudentByEmail, getMentorByEmail } from './queries.js';
import bcrypt from 'bcryptjs';

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

// Auth Route
app.post('/api/login', async (req, res) => {
    const { email, username, password, role } = req.body;
    const loginIdentifier = email || username;

    if (!loginIdentifier || !password || !role) {
        return res.status(400).json({ success: false, message: 'Missing credentials' });
    }

    try {
        const identifier = loginIdentifier.trim().toLowerCase();

        if (role === 'mentor') {
            const mentor = await getMentorByEmail(identifier);
            if (mentor && mentor.password) {
                // Support both hashed and plain text (fallback) for transition
                const isMatch = await bcrypt.compare(password, mentor.password).catch(() => password === mentor.password);
                if (isMatch) {
                    return res.json({
                        success: true,
                        user: {
                            username: mentor.name,
                            role: 'mentor',
                            email: mentor.email
                        }
                    });
                }
            }
        } else if (role === 'student') {
            const student = await getStudentByEmail(identifier);
            if (student) {
                // If student doesn't have a password set, we shouldn't allow default anymore
                if (student.password) {
                    const isMatch = await bcrypt.compare(password, student.password).catch(() => password === student.password);
                    if (isMatch) {
                        return res.json({
                            success: true,
                            user: {
                                username: student.name,
                                role: 'student',
                                studentId: student.id,
                                email: student.email
                            }
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'An internal error occurred' });
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
