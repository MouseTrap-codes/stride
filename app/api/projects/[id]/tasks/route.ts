import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validators";

// GET
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }

    const { id } = await params;

    // ensure project belongs to user
    const project = await prisma.project.findFirst({
        where: { id, userId },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Not found"}, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    
    const q = searchParams.get("q") ?? undefined;
    
    const statusParam = searchParams.get("status");
    const status = statusParam ? createTaskSchema.shape.status.safeParse(statusParam).data : undefined;

    const takeParam = searchParams.get("take");
    const skipParam = searchParams.get("skip");

    const take = takeParam 
        ? Math.min(Number(takeParam), 100)
        : 50;
    const skip = skipParam
        ? Math.max(Number(skipParam), 0)
        : 0;

    const tasks = await prisma.task.findMany({
        where: {
            projectId: id,  // Only tasks from THIS project
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
        orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ data: tasks }, { status: 200 });
}