import { Suspense } from "react";
import { getJukeboxList } from "@/src/lib/api/admin/jukebox/service";

import PlayList from "@/components/admin/jukebox/PlayList";

export default async function Page() {


    const jukeboxList = await getJukeboxList();

    console.log(jukeboxList);
    return (
        <div>
            {/* 플레이리스트 */}
            <Suspense>
                <PlayList jukeboxList={jukeboxList} />
            </Suspense>
        </div>
    );
}