"use client";
import Link from "next/link";
import s from "./topbar.module.css";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, Target, BarChart3, Settings } from "lucide-react";

export default function TopBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className={s.header}>
      <div className={s.container}>
        {/* corrigido: Tailwind válido */}
        <img src="/logo.png" alt="logo" className="h-[100px] w-[100px]" />
        <div className={s.pj}>
          <Link href="/" className={s.brand}>Poli Júnior</Link>
          <h1 className={s.subtext}>NTEC - Gestão de Projetos</h1>
        </div>

        <nav className={s.nav} aria-label="Navegação principal">
          <Link
            href="/"
            className={`${s.link} ${isActive("/") ? s.active : ""}`}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <Home className="h-6 w-6" />
            Dashboard
          </Link>

          <Link
            href="/projects"
            className={`${s.link} ${isActive("/projects") ? s.active : ""}`}
            aria-current={isActive("/projects") ? "page" : undefined}
          >
            <FolderKanban className="h-6 w-6" />
            Projetos
          </Link>

          <Link
            href="/okrs"
            className={`${s.link} ${isActive("/okrs") ? s.active : ""}`}
            aria-current={isActive("/okrs") ? "page" : undefined}
          >
            <Target className="h-6 w-6" />
            OKRs
          </Link>

          <Link
            href="/metrics"
            className={`${s.link} ${isActive("/metrics") ? s.active : ""}`}
            aria-current={isActive("/metrics") ? "page" : undefined}
          >
            <BarChart3 className="h-6 w-6" />
            Métricas
          </Link>

          <Link
            href="/settings"
            className={`${s.link} ${isActive("/settings") ? s.active : ""}`}
            aria-current={isActive("/settings") ? "page" : undefined}
          >
            <Settings className="h-6 w-6" />
            Configurações
          </Link>
        </nav>
      </div>
    </header>
  );
}
