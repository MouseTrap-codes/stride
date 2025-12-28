import { z } from "zod";
import { describe } from "zod/v4/core";

export const createProjectSchema = z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(2000).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();