import mongoose, { Schema, Document, Model } from 'mongoose';

export enum Role {
    SALESBOY = 'SALESBOY',
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
}

export interface IUser extends Document {
    username: string;
    password: string;
    role: Role;
    submittedAt: Date;
    deletedAt?: Date;
}

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(Role), required: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'submittedAt', updatedAt: false },
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
