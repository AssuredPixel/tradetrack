import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
    date: Date;
    customerName: string;
    amountCollected: number;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
    editedAt?: Date;
    deletedAt?: Date;
}

const CollectionSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        customerName: { type: String, required: true },
        amountCollected: { type: Number, required: true },
        notes: { type: String },
        submittedBy: { type: String, required: true },
        editedAt: { type: Date },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

CollectionSchema.index({ date: -1 });
CollectionSchema.index({ submittedAt: -1 });
CollectionSchema.index({ deletedAt: 1 });
CollectionSchema.index({ submittedBy: 1 });

const Collection: Model<ICollection> = mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;
