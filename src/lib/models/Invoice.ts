import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IInvoice extends Document {
  institution_id: Types.ObjectId;
  month: number;
  year: number;
  amount: number;
  owner: string;
}

const schema = new Schema<IInvoice>(
  {
    institution_id: { type: Schema.Types.ObjectId, required: true, ref: 'bills_institutions' },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, default: 0 },
    owner: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

schema.index({ institution_id: 1, month: 1, year: 1 }, { unique: true });

export const Invoice: Model<IInvoice> =
  mongoose.models.bills_monthly_invoices ||
  mongoose.model<IInvoice>('bills_monthly_invoices', schema);
