import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validators";

// GET
export async function GET(req: Request, { params }: { params: { id: string }}) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }

    // ensure prog belongs to user
    const project = await prisma.project.findFirst({
        where: { id: params.id, userId },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Not found"}, { status: 404 });
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
    });

    return NextResponse.json({ data: tasks }, { status: 200 });
}