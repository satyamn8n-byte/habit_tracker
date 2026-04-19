import express from 'express';
import Habit from '../models/Habit';
import HabitLog from '../models/HabitLog';
import auth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all habits for user
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habits', error });
  }
});

// Create habit
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { name, description, frequency, daysOfWeek } = req.body;
    const newHabit = new Habit({
      name,
      description,
      frequency,
      daysOfWeek,
      user: req.userId,
    });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating habit', error });
  }
});

// Toggle log
router.post('/toggle-log', auth, async (req: AuthRequest, res) => {
  try {
    const { habitId, date, completed } = req.body;
    
    // Normalize date to YYYY-MM-DD
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const log = await HabitLog.findOneAndUpdate(
      { habit: habitId, date: normalizedDate },
      { completed, user: req.userId },
      { upsert: true, new: true }
    );

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling habit log', error });
  }
});

// Get logs for date range
router.get('/logs', auth, async (req: AuthRequest, res) => {
  try {
    const { start, end } = req.query;
    const logs = await HabitLog.find({
      user: req.userId,
      date: {
        $gte: new Date(start as string),
        $lte: new Date(end as string),
      },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
  }
});

export default router;
