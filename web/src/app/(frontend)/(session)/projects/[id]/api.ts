// api.ts
export async function getProjectById(id: string) {
  const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
  if (!res.ok) {
    // opcional: se a API retorna 404 quando não encontra
    if (res.status === 404) return null;
    throw new Error(`Erro HTTP ${res.status}`);
  }
  return (await res.json()) ?? null;
}
