import cron from 'node-cron';
import User from '../models/User';
import Habit from '../models/Habit';
import HabitLog from '../models/HabitLog';
import { sendReminderEmail, sendWarningEmail } from './emailService';
import { formatInTimeZone } from 'date-fns-tz';

export const initScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const users = await User.find();

    for (const user of users) {
      const userTime = formatInTimeZone(now, user.timezone, 'HH:mm');
      const userDate = formatInTimeZone(now, user.timezone, 'yyyy-MM-dd');

      // 1. Check for Daily Reminder
      if (userTime === user.reminderTime) {
        // Ensure we only send once per day
        const lastSentDate = user.lastReminderSent ? formatInTimeZone(user.lastReminderSent, user.timezone, 'yyyy-MM-dd') : null;
        if (lastSentDate !== userDate) {
          await sendReminderEmail(user.email, user.email.split('@')[0]);
          user.lastReminderSent = now;
          await user.save();
          console.log(`Sent reminder to ${user.email}`);
        }
      }

      // 2. Check for Warning Email (12 hours later)
      // We calculate if 12 hours have passed since the reminderTime
      const [reminderH, reminderM] = user.reminderTime.split(':').map(Number);
      const warningH = (reminderH + 12) % 24;
      const warningTime = `${warningH.toString().padStart(2, '0')}:${reminderM.toString().padStart(2, '0')}`;

      if (userTime === warningTime) {
        const lastWarningSentDate = user.lastWarningSent ? formatInTimeZone(user.lastWarningSent, user.timezone, 'yyyy-MM-dd') : null;
        
        if (lastWarningSentDate !== userDate) {
          // Check if user has completed all active habits for today
          const activeHabits = await Habit.find({ user: user._id, active: true });
          const startOfDay = new Date(userDate);
          startOfDay.setUTCHours(0,0,0,0);

          const logs = await HabitLog.find({
            user: user._id,
            date: startOfDay,
            completed: true
          });

          if (logs.length < activeHabits.length) {
            await sendWarningEmail(user.email, user.email.split('@')[0]);
            console.log(`Sent warning to ${user.email}`);
          }
          
          user.lastWarningSent = now;
          await user.save();
        }
      }
    }
  });
};
