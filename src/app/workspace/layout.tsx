import { ShellGate } from "@/components/shell-gate";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellGate area="workspace">{children}</ShellGate>;
}
