// Project.schema.ts

import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { MongoProject } from '../types/MongoProject.types';

interface IMongoProject extends Document {
    name: string;
    status: "deleted" | "active" | "archived";
    id: string;
    createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    status: { type: String, required: true },
    id: { type: String, required: true, default: uuidv4 },
    createdAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.model<IMongoProject>('Project', ProjectSchema);
