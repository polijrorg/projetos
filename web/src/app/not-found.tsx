// app/not-found.tsx
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-[84px]">
      <section className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 dark:bg-card/80 backdrop-blur p-10 shadow-card">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground bg-accent/50">
            404 · Página não encontrada
          </span>

          {/* “404” com gradiente do tema */}
          <div className="mt-6 text-7xl font-extrabold leading-none tracking-tight text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
            404
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Oops! Não encontramos essa página.
          </h1>
          <p className="mt-2 text-muted-foreground">
            O link pode estar incorreto ou a página foi movida. Você pode voltar ao início ou explorar os projetos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-white shadow-elevated transition
                         bg-[hsl(var(--poli-blue))] hover:bg-[hsl(var(--poli-blue)/0.9)]"
            >
              <Home className="h-4 w-4" />
              Ir para o Dashboard
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 transition
                         border border-[color:var(--border)] bg-background hover:bg-[hsl(var(--poli-blue)/0.08)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver Projetos
            </Link>
          </div>
        </div>

        {/* detalhe decorativo sutil */}
        <p> joao guten easter egg - feat carlos eduardo tavares</p>
      </section>
    </main>
  );
}
