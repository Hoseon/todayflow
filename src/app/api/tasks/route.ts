import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/server-user";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dueDate = searchParams.get("dueDate");
  const userId = getCurrentUserId();

  const where = dueDate
    ? {
        userId,
        dueDate: {
          gte: new Date(`${dueDate}T00:00:00.000Z`),
          lt: new Date(`${dueDate}T23:59:59.999Z`),
        },
      }
    : { userId };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    title?: string;
    dueDate?: string;
    priority?: number;
  };

  if (!body.title || !body.dueDate) {
    return NextResponse.json({ message: "title, dueDate는 필수입니다." }, { status: 400 });
  }

  const priority = [1, 2, 3].includes(body.priority ?? 2) ? (body.priority as 1 | 2 | 3) : 2;
  const userId = getCurrentUserId();

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email: `${userId}@todayflow.local` },
    update: {},
  });

  const task = await prisma.task.create({
    data: {
      userId,
      title: body.title.trim(),
      dueDate: new Date(`${body.dueDate}T12:00:00.000Z`),
      priority,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
