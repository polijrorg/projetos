
import { NextRequest, NextResponse } from "next/server";
import { idSchema } from "@/app/(backend)/schemas/base.schema";
import { sprintCreateSchema } from "@/backend/schemas/sprint.schema";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { returnInvalidDataErrors, zodErrorHandler, validBody } from "@/utils";
import { createSprint, listSprintsByProject } from "@/app/(backend)/services/sprint";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    const projectId = idResult.data;

    const sprints = await listSprintsByProject(projectId);
    return NextResponse.json(sprints, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    const projectId = idResult.data;

    const body = await validBody(req);
    const parsed = sprintCreateSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    const data = parsed.data;

    
if (!data.startDate || !data.endDate) {
  return NextResponse.json(
    toErrorMessage("startDate e endDate são obrigatórios"),
    { status: 400 }
  );
}
    const created = await createSprint(projectId, {
      number: data.number,
      startDate: data.startDate,
      endDate: data.endDate,
      goals: data.goals ?? [],
      capacityHours: data.capacityHours ?? "",
    });

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
