export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-muted/40 print:bg-white">{children}</div>
}
