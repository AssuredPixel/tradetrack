import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStartingCapital extends Document {
    year: number;
    cashOnHand: number;
    flourOpeningQty: number;
    flourOpeningValuePerUnit: number;
    sugarOpeningQty: number;
    sugarOpeningValuePerUnit: number;
    oilOpeningQty: number;
    oilOpeningValuePerUnit: number;
    totalStartingCapital: number;
    setBy: string;
    setAt: Date;
    submittedAt: Date;
    deletedAt?: Date;
}

const StartingCapitalSchema: Schema = new Schema(
    {
        year: { type: Number, required: true, unique: true },
        cashOnHand: { type: Number, required: true },
        flourOpeningQty: { type: Number, required: true },
        flourOpeningValuePerUnit: { type: Number, required: true },
        sugarOpeningQty: { type: Number, required: true },
        sugarOpeningValuePerUnit: { type: Number, required: true },
        oilOpeningQty: { type: Number, required: true },
        oilOpeningValuePerUnit: { type: Number, required: true },
        totalStartingCapital: { type: Number, required: true },
        setBy: { type: String, required: true },
        setAt: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

const StartingCapital: Model<IStartingCapital> = mongoose.models.StartingCapital || mongoose.model<IStartingCapital>('StartingCapital', StartingCapitalSchema);

export default StartingCapital;
