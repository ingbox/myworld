export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-full min-h-[520px] overflow-hidden">{children}</div>;
}
