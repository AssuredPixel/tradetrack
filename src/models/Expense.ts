import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
    date: Date;
    description: string;
    amount: number;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
    deletedAt?: Date;
}

const ExpenseSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        notes: { type: String },
        submittedBy: { type: String, required: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
