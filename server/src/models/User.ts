import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  reminderTime: string; // HH:mm
  timezone: string;
  lastReminderSent: Date | null;
  lastWarningSent: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reminderTime: { type: String, default: '09:00' },
    timezone: { type: String, default: 'UTC' },
    lastReminderSent: { type: Date, default: null },
    lastWarningSent: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
