 
import { NextRequest, NextResponse } from "next/server";
import { idSchema } from "@/app/(backend)/schemas/base.schema";
import { sprintGoalSchema } from "@/backend/schemas/sprint.schema";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { returnInvalidDataErrors, zodErrorHandler, validBody } from "@/utils";
import { addGoal, removeGoal } from "@/app/(backend)/services/sprint";

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
    const parsed = sprintGoalSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    const updated = await addGoal(projectId, sprintNumber, parsed.data.goal);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; number: string }> }
) {
  try {
    const { id, number } = await context.params;
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    const projectId = idResult.data;
    const sprintNumber = Number(number);

    const { searchParams } = new URL(req.url);
    const idxStr = searchParams.get("index");
    if (!idxStr) return NextResponse.json(toErrorMessage("Parâmetro 'index' obrigatório"), { status: 400 });

    const idx = Number(idxStr);
    const updated = await removeGoal(projectId, sprintNumber, idx);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}
