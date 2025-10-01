/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { idSchema } from "@/app/(backend)/schemas/base.schema";
import { sprintUpdateSchema } from "@/backend/schemas/sprint.schema";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { returnInvalidDataErrors, zodErrorHandler, validBody } from "@/utils";
import { getSprintByNumber, updateSprint } from "@/app/(backend)/services/sprint";

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
    const sprint = await getSprintByNumber(projectId, sprintNumber);
    if (!sprint) return NextResponse.json(toErrorMessage("Sprint não encontrada"), { status: 404 });

    return NextResponse.json(sprint, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function PATCH(
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
    const parsed = sprintUpdateSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    const updated = await updateSprint(projectId, sprintNumber, {
      ...(parsed.data.startDate ? { startDate: new Date(parsed.data.startDate) } : {}),
      ...(parsed.data.endDate ? { endDate: new Date(parsed.data.endDate) } : {}),
      ...(parsed.data.goals ? { goals: parsed.data.goals } : {}),
    });

    return NextResponse.json(updated, { status: 200 });
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
