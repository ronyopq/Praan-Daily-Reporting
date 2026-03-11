import { ShellGate } from "@/components/shell-gate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellGate area="admin">{children}</ShellGate>;
}
