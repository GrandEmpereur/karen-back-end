// src/types/MongoProject.types.ts

export interface MongoProject {
    id: string;
    name: string;
    status: "deleted" | "active" | "archived";
    createdAt: Date;
}
