import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    table: string;
    recordId: string;
    performedBy: string;
    performedAt: Date;
    details: string;
    submittedAt: Date;
    deletedAt?: Date;
}

const AuditLogSchema: Schema = new Schema(
    {
        action: { type: String, required: true },
        table: { type: String, required: true },
        recordId: { type: String, required: true },
        performedBy: { type: String, required: true },
        performedAt: { type: Date, default: Date.now },
        details: { type: String, required: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ table: 1 });
AuditLogSchema.index({ performedAt: -1 });
AuditLogSchema.index({ submittedAt: -1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
