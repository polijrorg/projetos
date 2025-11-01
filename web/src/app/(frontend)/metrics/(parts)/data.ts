import type { ProjectWithNPS } from "./types";

/** Busca projetos do backend já com npsResponse incluso */
export async function fetchProjects(): Promise<ProjectWithNPS[]> {
  const res = await fetch("/api/projects?include=nps", { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao listar projetos (HTTP ${res.status})`);
  const data = await res.json();

  // Garanta um shape mínimo tipo ProjectWithNPS
  return (Array.isArray(data) ? data : []).map((p) => ({
    id: p.id,
    name: p.name,
    client: p.client,
    status: p.status,
    price: p.price ?? null,
    saleDate: p.saleDate ?? null,
    isENB: !!p.isENB,
    endDate: p.endDate ?? null,
    npsResponse: p.npsResponse
      ? {
          npsScore: p.npsResponse.npsScore,
          responseDate: p.npsResponse.responseDate,
        }
      : null,
  }));
}
