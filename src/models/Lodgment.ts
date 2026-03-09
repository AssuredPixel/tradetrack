import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILodgment extends Document {
    date: Date;
    amount: number;
    bankName: string;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
    editedAt?: Date;
    deletedAt?: Date;
}

const LodgmentSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        bankName: { type: String },
        notes: { type: String },
        submittedBy: { type: String, required: true },
        editedAt: { type: Date },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

LodgmentSchema.index({ date: -1 });
LodgmentSchema.index({ submittedAt: -1 });
LodgmentSchema.index({ deletedAt: 1 });
LodgmentSchema.index({ submittedBy: 1 });

const Lodgment: Model<ILodgment> = mongoose.models.Lodgment || mongoose.model<ILodgment>('Lodgment', LodgmentSchema);

export default Lodgment;
