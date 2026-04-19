import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitLog extends Document {
  habit: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitLogSchema: Schema = new Schema(
  {
    habit: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure a user can only have one log per habit per day
HabitLogSchema.index({ habit: 1, date: 1 }, { unique: true });

export default mongoose.model<IHabitLog>('HabitLog', HabitLogSchema);
