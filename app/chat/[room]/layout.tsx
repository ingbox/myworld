import { Providers } from "@/components/cy/common/Providers";

export default async function Layout({ children }: { children: React.ReactNode }) {

    return (
        <Providers>
            {children}
        </Providers>
    );
}