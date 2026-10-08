import mongoose, { Model, Schema } from 'mongoose';

// Compiles a model, replacing any copy left over from before a hot reload.
// Reusing the old copy would keep validating against the old schema until
// the dev server restarts.
export function compileModel<T>(name: string, schema: Schema): Model<T> {
    if (mongoose.models[name]) mongoose.deleteModel(name);
    // Cast instead of mongoose.model<T>(), whose inferred types exhaust tsc memory.
    return mongoose.model(name, schema) as unknown as Model<T>;
}
