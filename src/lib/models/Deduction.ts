import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDeduction extends Document {
  description: string;
  position: number;
  owner: string;
  salary_period: 1 | 2 | null;
}

const schema = new Schema<IDeduction>(
  {
    description: { type: String, required: true },
    position: { type: Number, default: 0 },
    owner: { type: String, required: true, index: true },
    salary_period: { type: Number, enum: [1, 2, null], default: null },
  },
  { timestamps: true }
);

export const Deduction: Model<IDeduction> =
  mongoose.models.bills_deductions ||
  mongoose.model<IDeduction>('bills_deductions', schema);
