import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FilePlus,
    Settings,
    ShieldCheck
} from "lucide-react";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";
import { getMyProfile } from "@/services/api";

interface MemberLayoutProps {
    children: ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
    const location = useLocation();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const menuItems = [
        { title: "Dashboard", icon: LayoutDashboard, path: "/member/dashboard" },
        { title: "File a Claim", icon: FilePlus, path: "/member/file-claim" },
        { title: "Settings", icon: Settings, path: "/member/settings" },
    ];

    const currentTitle = menuItems.find(i => i.path === location.pathname)?.title || "Member Portal";

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const StatusCard = () => (
        <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden mb-2">
            <ShieldCheck className="h-12 w-12 text-blue-500/20 absolute -right-2 -bottom-2" />
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-sm font-bold truncate">Fully Protected</p>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <ResponsiveSidebar
                items={menuItems}
                theme="light"
                user={profile ? {
                    name: profile.fullName,
                    email: profile.email,
                    initials: profile.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                } : undefined}
                onLogout={handleLogout}
                extraFooter={<StatusCard />}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 min-h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 lg:hidden sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10" /> {/* Spacer for hamburger */}
                        <h1 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{currentTitle}</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-50/50">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MemberLayout;
