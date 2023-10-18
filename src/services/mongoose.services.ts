import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.schema';
import { MongoProject } from '../types/MongoProject.types';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function connect() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is undefined');
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
        });

        console.log('Successfully connected to MongoDB');
        return true;
    } catch (error) {
        console.error('Error connecting to MongoDB: ', error);
        return false;
    }
}

/**
 * @async
 * @function createNewProject
 * @description Create a new project in the database.
 * @param {string} companyName - The name of the company.
 * @param {string} paymentStatus - The payment status of the project.
 * @param {Array<Object>} contacts - The contact persons for the project.
 * @returns {Promise<MongoProject | undefined>} - The created project or undefined if there was an error.
 */
export async function createNewProject(): Promise<MongoProject[] | undefined> {
    try {
        const isConnected = await connect();
        if (!isConnected) {
            throw new Error('Error connecting to MongoDB');
        }

        const uploadDir = path.join(__dirname, '..', 'uploads');
        const files = fs.readdirSync(uploadDir);
        const configFiles = files.filter(file => /^.*_config\.json$/.test(file));

        const savedProjects = [];
        for (const configFile of configFiles) {
            const filePath = path.join(uploadDir, configFile);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const parsedData = JSON.parse(fileContent);

            const newProject = new Project({
                name: parsedData.name,
                status: parsedData.status,
                id: parsedData.id,
            });
            
            const savedProject = await newProject.save();
            savedProjects.push(savedProject);

            // Delete the file after saving the project to the database
            fs.unlinkSync(filePath);
        }

        console.log('Projects created successfully:', savedProjects);
        return savedProjects;
    } catch (error) {
        console.error('Error creating new projects:', error);
        return undefined;
    }
}

/**
 * @async
 * @function updateProjectStatus
 * @description Update the payment status of a project.
 * @param {string} projectId - The ID of the project to update.
 * @param {string} newStatus - The new payment status.
 * @returns {Promise<MongoProject | null>} - The updated project or null if the project was not found.
 */
export async function updateProjectStatus(
    projectId: string,
    newStatus: string,
): Promise<MongoProject | null> {
    try {
        const isConnected = await connect();
        if (!isConnected) {
            throw new Error('Error connecting to MongoDB');
        }

        // Trouver le projet et mettre à jour le statut
        const updatedProject = await Project.findOneAndUpdate(
            { id: projectId }, // Critère de recherche
            { status: newStatus }, // Mise à jour des champs
            { new: true, runValidators: true } // Options : retourner le nouveau document et exécuter les validateurs
        );

        // Si le projet n'existe pas, retourner null
        if (!updatedProject) {
            console.error('Project not found:', projectId);
            return null;
        }

        console.log('Project updated successfully:', updatedProject);
        return updatedProject;
    } catch (error) {
        console.error('Error updating project status:', error);
        return null;
    }
}


/**
 * @async
 * @function checkProjectStatus
 * @description Check the payment status of a project.
 * @param {string} projectId - The ID of the project to check.
 * @returns {Promise<string | null>} - The payment status of the project or null if the project was not found.
 */
export async function checkProjectStatus(projectId: string): Promise<string | null> {
    try {
        const response = await connect();
        if (!response) {
            throw new Error('Error connecting to MongoDB');
        }

        // Trouver le projet par ID
        const project = await Project.findOne({ id: projectId });

        // Si le projet n'existe pas, retourner null
        if (!project) {
            console.error('Project not found:', projectId);
            return null;
        }

        // Retourner le statut du projet
        return project.status;
    } catch (error) {
        console.error(error);
        return null;
    }
}
