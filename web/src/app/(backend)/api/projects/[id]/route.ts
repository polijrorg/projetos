import { NextRequest, NextResponse } from 'next/server'
import { idSchema } from '@/backend/schemas';
import { zodErrorHandler } from '@/utils';
import { toErrorMessage } from '@/utils/api/toErrorMessage';
import { deleteProject, getProjectById } from '@/app/(backend)/services/projects';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validationResult = idSchema.safeParse(id);
    
    if (!validationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID inválido'),
        { status: 400 }
      )
    }

    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json(
        toErrorMessage('Matéria não encontrada'),
        { status: 404 }
      )
    }

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params;
  
    const validationResult = idSchema.safeParse(id);

    if (!validationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID Inválido'),
        { status: 400 }
      )
    }

    const project = await deleteProject(id);
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}
