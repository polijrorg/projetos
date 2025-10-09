import { NextRequest, NextResponse } from "next/server";
import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { createOkrSchema } from "../../schemas/okr.schema";
import { createOkr, getAllOkrs } from "../../services/okr";

export async function GET() {
  try {
    const okrs = await getAllOkrs();
    console.log(okrs);
    return NextResponse.json(okrs);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);    
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validBody(request);

    const validationResult = createOkrSchema.safeParse(body)
       
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const validatedData = validationResult.data

    const okr = await createOkr(validatedData)

    return NextResponse.json(okr, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) {  
      return error;
    }
    
    if (error instanceof Error) {
      if (error instanceof Error) {
        if (error.message.includes('Prisma')) {
          return NextResponse.json(
            toErrorMessage('Erro no banco de dados - Verifique os dados fornecidos'),
            { status: 400 }
          )
        }
      }
    }

    return zodErrorHandler(error);
  }
}