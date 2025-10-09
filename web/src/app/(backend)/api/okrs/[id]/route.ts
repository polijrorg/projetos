import { idSchema } from "@/app/(backend)/schemas";
import { getOkrById } from "@/app/(backend)/services/okr";
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
