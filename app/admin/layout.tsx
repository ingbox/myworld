import UserStats from '@/components/admin/home/UserStats';
import { getUserStats } from '../actions/common/home';
import Clip from '@/components/layout/item/Clip';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const initStats = await getUserStats();

    return (
        <div className="bg-[#727272]">
            <div className="w-[1920px] h-screen"
                style={{
                    backgroundColor: '#727272',
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='20' y2='0' stroke='white' stroke-width='2' stroke-dasharray='2 2' stroke-opacity='0.15'/><line x1='0' y1='0' x2='0' y2='20' stroke='white' stroke-width='2' stroke-dasharray='2 2' stroke-opacity='0.15'/></svg>")`
                }}
            >
                <div className="w-7xl flex border-blue-500 mx-auto pt-10">

                    <div className="relative pr-8 flex">
                        <Clip />
                        {children}
                    </div>

                    <UserStats initStats={initStats} />
                </div>
            </div>
        </div>
    );
}