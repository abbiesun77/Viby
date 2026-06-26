import "./workspace.css";
import { PageTransition } from "../../components/workspace/page-transition";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="vbyws">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
