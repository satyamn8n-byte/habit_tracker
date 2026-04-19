import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  name: string;
  description: string;
  user: mongoose.Types.ObjectId;
  frequency: 'daily' | 'specific_days';
  daysOfWeek: number[]; // 0=Sunday, 1=Monday...
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    frequency: { type: String, enum: ['daily', 'specific_days'], default: 'daily' },
    daysOfWeek: { type: [Number], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHabit>('Habit', HabitSchema);
