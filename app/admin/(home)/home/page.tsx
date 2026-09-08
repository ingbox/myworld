import AdminNavigation from "@/components/layout/AdminNavigation";
import MiniroomEditor from "@/components/admin/home/MiniroomEditor";
import { getMiniroom, getMiniroomItems } from "@/src/lib/api/admin/home/service";

export default async function Page() {
    const [items, miniroom] = await Promise.all([
        getMiniroomItems(),
        getMiniroom(),
    ]);

    return (
        <>
            <AdminNavigation />
            <MiniroomEditor
                items={items}
                ititialLayers={miniroom?.layers ?? []}
                backgroundUrl={miniroom?.url}
            />
        </>
    );
}
