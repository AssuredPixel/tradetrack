import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILodgment extends Document {
    date: Date;
    amount: number;
    bankName: string;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
    deletedAt?: Date;
}

const LodgmentSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        bankName: { type: String, required: true },
        notes: { type: String },
        submittedBy: { type: String, required: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

const Lodgment: Model<ILodgment> = mongoose.models.Lodgment || mongoose.model<ILodgment>('Lodgment', LodgmentSchema);

export default Lodgment;
