export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-7 py-5">
            {children}
        </div>
    )
}