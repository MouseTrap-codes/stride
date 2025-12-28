import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validators"

// GET
export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId") ?? undefined;
    const q = searchParams.get("q") ?? undefined;

    const statusParam = searchParams.get("status");
    const status = statusParam ? createTaskSchema.shape.status.safeParse(statusParam).data : undefined;
    
    const takeRaw = Number(searchParams.get("take"));
    const skipRaw = Number(searchParams.get("skip"));

    const take = Math.min(Number.isFinite(takeRaw) ? takeRaw : 50, 100);
    const skip = Math.max(Number.isFinite(skipRaw) ? skipRaw : 0, 0);

    const tasks = await prisma.task.findMany({
        where: {
            project: { userId },

            ...(projectId ? { projectId } : {}),
            ...(status ? { status } : {}),
            ...(q 
                ? {
                    OR: [
                        { title: { contains: q, mode: "insensitive" as const}},
                        { description: { contains: q, mode: "insensitive" as const}},
                    ],
                }
            : {}),
        },
        orderBy: {createdAt: "desc"},
        take,
        skip,
        select: {
            id: true,
            title: true,
            description: true,
            status: true, 
            projectId: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return NextResponse.json({ data: tasks }, { status: 200});
}

// POST 
export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid body", details: parsed.error.flatten() },
            { status: 400}
        );
    }

    const project = await prisma.project.findFirst({
        where: { id: parsed.data.projectId, userId },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found"}, {status: 404});
    }

    const task = await prisma.task.create({
        data: {
            title: parsed.data.title,
            description: parsed.data.description,
            status: parsed.data.status,
            projectId: parsed.data.projectId,
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            projectId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json({ data: task }, { status: 201 });
}