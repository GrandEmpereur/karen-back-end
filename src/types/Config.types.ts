// src/types/Config.types.ts
import { v4 as uuidv4 } from 'uuid';

export interface Config {
    id?: string;
    name: string;
    status: "deleted" | "active" | "archived";
    created?: Date;
}

// Default values
export const defaultConfig: Config = {
    name: '',
    status: 'active',
    created: new Date(),
};
