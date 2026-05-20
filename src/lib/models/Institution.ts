import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  due_day: number;
  payment_installment: 1 | 2 | null;
  position: number;
  abbreviation: string | null;
  owner: string;
}

const schema = new Schema<IInstitution>(
  {
    name: { type: String, required: true },
    due_day: { type: Number, required: true, min: 1, max: 31 },
    payment_installment: { type: Number, enum: [1, 2, null], default: null },
    position: { type: Number, default: 0 },
    abbreviation: { type: String, default: null },
    owner: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Institution: Model<IInstitution> =
  mongoose.models.bills_institutions ||
  mongoose.model<IInstitution>('bills_institutions', schema);
