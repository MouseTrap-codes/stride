import { stat } from "fs";
import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(2000).nullable().optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(2000).nullable().optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
})

export const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().datetime().optional(),
    projectId: z.string().min(1),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().datetime().optional(),
    projectId: z.string().min(1),
})

