import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStartingCapital extends Document {
    year: number;
    cashOnHand: number;
    flourBags: number;
    flourPricePerBag: number;
    sugarBags: number;
    sugarPricePerBag: number;
    oilRubbers: number;
    oilPricePerRubber: number;
    totalValue: number;
    setBy: string;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StartingCapitalSchema: Schema = new Schema(
    {
        year: { type: Number, required: true, unique: true },
        cashOnHand: { type: Number, required: true },
        flourBags: { type: Number, required: true },
        flourPricePerBag: { type: Number, required: true },
        sugarBags: { type: Number, required: true },
        sugarPricePerBag: { type: Number, required: true },
        oilRubbers: { type: Number, required: true },
        oilPricePerRubber: { type: Number, required: true },
        totalValue: { type: Number, required: true },
        setBy: { type: String, required: true },
        isLocked: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

// Prevent re-compilation
const StartingCapital: Model<IStartingCapital> = mongoose.models.StartingCapital || mongoose.model<IStartingCapital>('StartingCapital', StartingCapitalSchema);

export default StartingCapital;
