import { NextRequest, NextResponse } from "next/server";
import { idSchema } from "@/backend/schemas";
import { zodErrorHandler } from "@/utils";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { deleteProject, getProjectById, updateProject } from "@/app/(backend)/services/projects";
import { patchProjectSchema } from "@/app/(backend)/schemas/project.schema";

export async function GET(
request: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    }

    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json(toErrorMessage("Projeto não encontrado"), { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function DELETE(
request: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    }

    const project = await deleteProject(id);
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function PATCH(
  request: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // valida ID
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    }

    // tenta ler o body
    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return NextResponse.json(toErrorMessage("Body inválido"), { status: 400 });
    }

    // valida PATCH com Zod
    const parsed = patchProjectSchema.safeParse(json);
    if (!parsed.success) {
      // se você já tem um handler, pode usar ele; abaixo um fallback simples
      return NextResponse.json(
        { error: "Validação falhou", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // A PARTIR DAQUI parsed.data NÃO É undefined
    const updated = await updateProject(id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

