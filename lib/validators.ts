import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(2000).nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    projectId: z.string().min(1),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    projectId: z.string().min(1).optional(),
})

