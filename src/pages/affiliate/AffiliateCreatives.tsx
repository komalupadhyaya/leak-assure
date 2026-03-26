import { useEffect, useState } from "react";
import AffiliateLayout from "./AffiliateLayout";
import { affiliateGetCreatives } from "@/services/affiliateApi";
import { Download, ExternalLink, Image } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateCreatives() {
    const [creatives, setCreatives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        affiliateGetCreatives()
            .then(setCreatives)
            .catch(() => toast.error("Failed to load marketing materials"))
            .finally(() => setLoading(false));
    }, []);

    const typeColor = (t: string) =>
        t === "banner" ? "bg-purple-100 text-purple-700" :
        t === "link" ? "bg-blue-100 text-blue-700" :
        "bg-slate-100 text-slate-700";

    return (
        <AffiliateLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing Materials</h1>
                    <p className="text-sm text-slate-500 mt-1">Download banners and links to promote Leak Assure.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
                ) : creatives.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 text-center py-16 text-slate-400">
                        <Image className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-semibold">No materials yet</p>
                        <p className="text-sm mt-1">Check back soon — your affiliate manager will upload creatives here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {creatives.map((c) => (
                            <div key={c._id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
                                <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Image className="h-6 w-6 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">{c.title}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColor(c.fileType)}`}>{c.fileType}</span>
                                </div>
                                <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                                    className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mt-1">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AffiliateLayout>
    );
}
