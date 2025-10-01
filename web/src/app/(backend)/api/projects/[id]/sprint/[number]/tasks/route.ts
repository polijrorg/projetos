/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { idSchema } from "@/app/(backend)/schemas/base.schema";
import { taskCreateSchema } from "@/backend/schemas/sprint.schema";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { returnInvalidDataErrors, zodErrorHandler, validBody } from "@/utils";
import { listTasks } from "@/app/(backend)/services/sprint";
import { createTask } from "@/app/(backend)/services/sprint";
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string; number: string }> }
) {
  try {
    const { id, number } = await context.params;
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    const projectId = idResult.data;

    const sprintNumber = Number(number);
    const data = await listTasks(projectId, sprintNumber);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; number: string }> }
) {
  try {
    const { id, number } = await context.params;
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    const projectId = idResult.data;

    const sprintNumber = Number(number);
    const body = await validBody(req);
    const parsed = taskCreateSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    const created = await createTask(projectId, sprintNumber, parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;

    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        toErrorMessage("Erro no banco de dados - Verifique os dados fornecidos"),
        { status: 400 }
      );
    }

    return zodErrorHandler(error);
  }
}
