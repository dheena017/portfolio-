import express from 'express';
import { getAllStudents, getStudentById, getStudentsByTerm, updateStudent, getStudentPasswordById, updateStudentPassword, createStudent } from '../queries.js';
import { handleSupabaseError } from '../supabaseClient.js';
import { requireCoreLeadership } from '../middleware/coreLeadershipAuth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await getAllStudents();
        res.json({ success: true, data });
    } catch (error) {
        const err = handleSupabaseError(error);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await getStudentById(parseInt(req.params.id));
        if (!data) return res.status(404).json({ success: false, error: 'Student not found' });
        res.json({ success: true, data });
    } catch (error) {
        const err = handleSupabaseError(error);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/term/:term', async (req, res) => {
    try {
        const data = await getStudentsByTerm(req.params.term);
        res.json({ success: true, data });
    } catch (error) {
        const err = handleSupabaseError(error);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        // Never allow password to be updated through the general update route
        const { password, ...safeUpdates } = req.body;
        const data = await updateStudent(parseInt(req.params.id), safeUpdates);
        res.json({ success: true, data });
    } catch (error) {
        const err = handleSupabaseError(error);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Change password route — requires current password verification
router.post('/:id/change-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const studentId = parseInt(req.params.id);

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    try {
        const storedPassword = await getStudentPasswordById(studentId);
        if (storedPassword === null) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        // Support both hashed and plain text (fallback) for transition
        const isMatch = await bcrypt.compare(currentPassword, storedPassword).catch(() => currentPassword === storedPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await updateStudentPassword(studentId, hashedNewPassword);
        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        const err = handleSupabaseError(error);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/students - create new student
router.post('/', requireCoreLeadership, async (req, res) => {
    try {
        const { password, ...payload } = req.body || {};

        if (password) {
            payload.password = await bcrypt.hash(password, 10);
        }

        const created = await createStudent(payload);
        res.status(201).json({ success: true, data: created });
    } catch (error) {
        const err = handleSupabaseError(error);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
