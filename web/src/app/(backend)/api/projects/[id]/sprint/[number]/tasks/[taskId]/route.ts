 
import { NextRequest, NextResponse } from "next/server";
import { idSchema } from "@/app/(backend)/schemas/base.schema";
import { taskUpdateSchema } from "@/backend/schemas/sprint.schema";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { returnInvalidDataErrors, zodErrorHandler, validBody } from "@/utils";
import { updateTask } from "@/app/(backend)/services/sprint";
import { deleteTask } from "@/app/(backend)/services/sprint";
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; number: string; taskId: string }> }
) {
  try {
    const { id, number, taskId } = await context.params;
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    const projectId = idResult.data;

    const sprintNumber = Number(number);
    const body = await validBody(req);
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    const updated = await updateTask(projectId, sprintNumber, taskId, parsed.data);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string; number: string; taskId: string }> }
) {
  try {
    const { id, number, taskId } = await context.params;
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    const projectId = idResult.data;

    const sprintNumber = Number(number);
    const res = await deleteTask(projectId, sprintNumber, taskId);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}
