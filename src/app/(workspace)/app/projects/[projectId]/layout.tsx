import Link from "next/link";
import { loadProject } from "../../../../../lib/db/projects";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { project, creditBalance } = await loadProject(params.projectId);

  return (
    <>
      <nav className="topnav">
        <div className="tn-left">
          <Link href="/app" className="tn-logo">Viby</Link>
          <span className="tn-sep">/</span>
          <Link href="/app">项目列表</Link>
          <span className="tn-sep">/</span>
          <span className="tn-proj">{project.title}</span>
        </div>
        <div className="tn-right">
          <span className={`credit-pill${creditBalance < 20 ? " warn" : ""}`}>
            Credit <b>{creditBalance}</b>
          </span>
          <Link href="/app/settings" className="tn-btn">设置</Link>
          <Link href={`/app/projects/${project.id}/export`} className="tn-btn solid">
            导出
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
