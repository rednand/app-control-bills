import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMonthlyDeduction extends Document {
  deduction_id: Types.ObjectId;
  month: number;
  year: number;
  amount: number;
  note: string | null;
  owner: string;
}

const schema = new Schema<IMonthlyDeduction>(
  {
    deduction_id: { type: Schema.Types.ObjectId, required: true, ref: 'bills_deductions' },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, default: 0 },
    note: { type: String, default: null },
    owner: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

schema.index({ deduction_id: 1, month: 1, year: 1 }, { unique: true });

export const MonthlyDeduction: Model<IMonthlyDeduction> =
  mongoose.models.bills_monthly_deductions ||
  mongoose.model<IMonthlyDeduction>('bills_monthly_deductions', schema);
