import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISalaryConfig extends Document {
  month: number;
  year: number;
  installment_1: number;
  installment_2: number;
  owner: string;
}

const schema = new Schema<ISalaryConfig>(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    installment_1: { type: Number, default: 0 },
    installment_2: { type: Number, default: 0 },
    owner: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

schema.index({ month: 1, year: 1, owner: 1 }, { unique: true });

export const SalaryConfig: Model<ISalaryConfig> =
  mongoose.models.bills_salary_config ||
  mongoose.model<ISalaryConfig>('bills_salary_config', schema);
