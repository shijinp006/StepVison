import mongoose, { InferSchemaType } from 'mongoose';
import { compileModel } from './compileModel';
import { EMAIL_PATTERN } from '../schemas/common';

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [254, 'Email must be 254 characters or fewer'],
            match: [EMAIL_PATTERN, 'Enter a valid email address'],
        },
        passwordHash: { type: String, required: true },
        name: {
            type: String,
            default: 'Administrator',
            trim: true,
            maxlength: [100, 'Name must be 100 characters or fewer'],
        },
    },
    { timestamps: true }
);

export type AdminFields = InferSchemaType<typeof adminSchema>;

export const Admin = compileModel<AdminFields>('Admin', adminSchema);
