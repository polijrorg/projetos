import { idSchema } from "@/app/(backend)/schemas";
import { patchOkrSchema } from "@/app/(backend)/schemas/okr.schema";
import { getOkrById, updateOkr } from "@/app/(backend)/services/okr";
import { zodErrorHandler } from "@/utils";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }){
  try {
    const { id } = await params;

    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    }

    const okr = await getOkrById(id);
    if (!okr) {
      return NextResponse.json(toErrorMessage("Okr não encontrada"), { status: 404 });
    }

    return NextResponse.json(okr, { status: 200 });
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
    const parsed = patchOkrSchema.safeParse(json);
    if (!parsed.success) {
      // se você já tem um handler, pode usar ele; abaixo um fallback simples
      return NextResponse.json(
        { error: "Validação falhou", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // A PARTIR DAQUI parsed.data NÃO É undefined
    const updated = await updateOkr(id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}