import "../(workspace)/workspace.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="vbyws">{children}</div>;
}
