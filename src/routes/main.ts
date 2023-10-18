/**
 * @module RouterModule
 * @description This module exports a Koa router object with defined routes.
 */
import Router, { RouterContext } from 'koa-router';
import koaBody from 'koa-body';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Services
import { rateLimiter } from '../middlewares/rateLimitMiddleware';
import { checkProjectStatus, createNewProject, updateProjectStatus } from '../services/mongoose.services';


const ROUTER_OPTIONS = {
    prefix: '/api/v1',
};

/**
 * Middleware for error handling.
 * @async
 * @param {RouterContext} ctx - The Koa context.
 * @param {Function} next - The next middleware function.
 */
async function errorHandler(ctx: any, next: any) {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
        ctx.app.emit('error', err, ctx);
    }
}

export default new Router(ROUTER_OPTIONS)
    .use(errorHandler) // Error handling middleware

    /**
     * Route for uploading configuration data.
     * @async
     * @function
     * @param {RouterContext} ctx - The Koa context.
     * @returns {Promise<void>} - Empty promise.
     */
    .post('/upload', rateLimiter(5, 1), koaBody(), async (ctx: RouterContext): Promise<void> => {
        try {
            const data = ctx.request.body.data;
            console.log(data);

            if (!data) {
                ctx.throw(400, 'Data missing');
            }

            const parsedData = JSON.parse(data);
            const id = parsedData.id;

            if (!id ) {
                ctx.throw(400, 'Invalid ID');
            }

            const dirPath = path.join(__dirname, '..', 'uploads');
            const filePath = path.join(dirPath, `${id}_config.json`);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }

            fs.writeFileSync(filePath, data, 'utf8');

            await createNewProject();

            ctx.status = 200;
            ctx.body = {
                response: 'ok',
            };
        } catch (error) {
            throw new Error(error);
        }
    })

    /**
     * Route for checking the status of a project by ID.
     * @async
     * @function
     * @param {RouterContext} ctx - The Koa context.
     * @returns {Promise<void>} - Empty promise.
     */
    .get('/status/:id', rateLimiter(5, 1), async (ctx: RouterContext): Promise<void> => {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.throw(400, 'Invalid ID');
            }

            const response = await checkProjectStatus(id);

            if (response === null) {
                ctx.throw(404, 'Project not found');
            }

            ctx.status = 200;
            ctx.body = {
                status: response,
            };
        } catch (error) {
            throw new Error(error);
        }
    })

    .patch('/update-status', rateLimiter(5, 1), koaBody(), async (ctx: RouterContext): Promise<void> => {
        try {
            const { projectId, newStatus } = ctx.request.body;

            // Validation des données d'entrée
            if (!projectId || !newStatus) {
                ctx.throw(400, 'Project ID and new status are required');
            }

            const updatedProject = await updateProjectStatus(projectId, newStatus);

            if (!updatedProject) {
                ctx.throw(404, 'Project not found or update failed');
            }

            ctx.status = 200;
            ctx.body = {
                message: 'Project status updated successfully',
                project: updatedProject,
            };
        } catch (error) {
            ctx.throw(500, `Error updating project status: ${error.message}`);
        }
    });
