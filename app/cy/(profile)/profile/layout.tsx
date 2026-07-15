export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-7 py-5 max-md:px-2 max-md:py-2">
            {children}
        </div>
    )
}