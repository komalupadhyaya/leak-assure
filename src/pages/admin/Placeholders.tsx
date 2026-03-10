import AdminLayout from "./AdminLayout";
const Placeholder = ({ title }: { title: string }) => (
    <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{title} Page</h2>
            <p className="text-slate-500 text-sm mt-2">This feature is coming soon.</p>
        </div>
    </AdminLayout>
);
export const Affiliates = () => <Placeholder title="Affiliates" />;
export const Settings = () => <Placeholder title="Settings" />;
