/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/backend/services/db";
import { createProjectSchema } from "@/app/(backend)/schemas/project.schema";
import { toErrorMessage } from "@/utils/api/toErrorMessage";


// ---- utilitários ----
const statusMap: Record<string, string> = {
  "Concluído": "Finalizado",
  "Executando": "Normal",
};

function mapStatus(input?: string | null) {
  if (!input) return input;
  return statusMap[input] ?? input;
}

function toDateOrNull(v: unknown): Date | null {
  if (!v || v === 0) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function normalizeAnalysts(raw: unknown): Array<{ name: string; role: "Front" }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a) => {
      if (typeof a === "string") return { name: a, role: "Front" as const };
      if (a && typeof a === "object" && "name" in a) {
        const name = String((a as any).name);
        return { name, role: "Front" as const };
      }
      return null;
    })
    .filter(Boolean) as Array<{ name: string; role: "Front" }>;
}



// ---- rota ----
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    if (!Array.isArray(json)) {
      return NextResponse.json(
        toErrorMessage("Body precisa ser um array de projetos"),
        { status: 400 }
      );
    }

    // Normalização + regras por item antes da validação
    const prepared = json.map((item: any, index: number) => {
      // aplica mapeamento de status e regra do endDate
      const mappedStatus = mapStatus(item.status);

      // planned/start/sale/end -> Date
      const plannedEndDate = toDateOrNull(item.plannedEndDate);
      const startDate = toDateOrNull(item.startDate);
      const saleDate = toDateOrNull(item.saleDate);

      let endDate: Date | null = null;
      if (mappedStatus === "Finalizado") {
        endDate = plannedEndDate; // sua regra
      } else if (mappedStatus === "Normal") {
        endDate = null; // sua regra
      } else {
        // outros status -> null conforme sua instrução
        endDate = null;
      }

      // analysts -> sempre role Front
      const analysts = normalizeAnalysts(item.analysts);

      // sprintNumber default = 0 (você removeu do payload)
      const sprintNumber =
        typeof item.sprintNumber === "number" ? item.sprintNumber : 0;

      // shortDescription obrigatória = "--"
      const shortDescription =
        typeof item.shortDescription === "string" && item.shortDescription.trim()
          ? item.shortDescription
          : "--";

      return {
        // campos obrigatórios segundo seu serviço/schema
        name: item.name,
        client: item.client,
        shortDescription,
        plannedEndDate,
        startDate,
        sprintNumber,
        endDate,
        price: typeof item.price === "number" ? item.price : null,
        analysts,
        saleDate,
        // se seu createProjectSchema tiver "status", inclua, senão o schema vai ignorar
        status: mappedStatus,
        __idx: index, // rastrear a posição para relatar erros
      };
    });

    // validação com seu schema de item
    const errors: Array<{ index: number; name?: string; issues: any }> = [];
    const validItems: any[] = [];

    for (const item of prepared) {
      const { __idx, ...data } = item;
      const parsed = createProjectSchema.safeParse(data);
      if (!parsed.success) {
        errors.push({
          index: __idx,
          name: data?.name,
          issues: parsed.error.flatten(),
        });
        continue;
      }

      // validação adicional: saleDate exigido pelo seu service atual
      if (!(parsed.data as any).saleDate) {
        errors.push({
          index: __idx,
          name: (parsed.data as any).name,
          issues: { formErrors: ["saleDate é obrigatório"] },
        });
        continue;
      }

      validItems.push(parsed.data);
    }

    if (validItems.length === 0) {
      return NextResponse.json(
        {
          message: "Nenhum item válido para criar",
          errors,
        },
        { status: 400 }
      );
    }

    // criação em transação (nested analysts exige create, não dá para usar createMany)
    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of validItems) {
        const p = await tx.project.create({
          data: {
            name: item.name,
            client: item.client,
            shortDescription: item.shortDescription,
            plannedEndDate: item.plannedEndDate,
            startDate: item.startDate,
            endDate: item.endDate ?? null,
            price: item.price ?? null,
            sprintNumber: item.sprintNumber,
            saleDate: item.saleDate,
            // se seu modelo tiver "status", descomente:
            // status: item.status,
            analysts: {
              create: item.analysts?.map((a: any) => ({
                name: a.name,
                role: a.role, // sempre "Front"
              })) ?? [],
            },
          },
          include: { analysts: true },
        });
        results.push(p);
      }
      return results;
    });

    return NextResponse.json(
      {
        createdCount: created.length,
        created,
        errors: errors.length ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (err: any) {
    // erros de Prisma
    if (err?.message?.includes?.("Prisma")) {
      return NextResponse.json(
        toErrorMessage("Erro no banco de dados - Verifique os dados fornecidos"),
        { status: 400 }
      );
    }

    return NextResponse.json(
      toErrorMessage("Falha ao processar bulk"),
      { status: 500 }
    );
  }
}
