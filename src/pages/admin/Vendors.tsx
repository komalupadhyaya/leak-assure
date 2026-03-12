import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getVendors, createVendor, updateVendor, deleteVendor } from "@/services/api";
import {
    Plus,
    MoreHorizontal,
    Phone,
    Mail,
    Building2,
    User,
    Trash2,
    Edit2,
    Search,
    X,
    CheckCircle2,
    Calendar
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/ui/AlertModal";

const Vendors = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
    const [editingVendor, setEditingVendor] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        phone: "",
        email: "",
        notes: ""
    });

    const fetchVendors = async () => {
        try {
            const data = await getVendors();
            setVendors(data);
        } catch (error) {
            toast.error("Failed to fetch vendors");
        } finally {
            setLoading(false);
        }
    };

    const [searchParams, setSearchParams] = useSearchParams();

    const handleOpenModal = useCallback((vendor: any = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({
                name: vendor.name,
                company: vendor.company,
                phone: vendor.phone,
                email: vendor.email,
                notes: vendor.notes || ""
            });
        } else {
            setEditingVendor(null);
            setFormData({
                name: "",
                company: "",
                phone: "",
                email: "",
                notes: ""
            });
        }
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        const returnTo = searchParams.get("returnTo");
        if (returnTo) {
            navigate(returnTo);
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        fetchVendors();
        if (searchParams.get("add") === "true") {
            handleOpenModal();
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("add");
            setSearchParams(newParams);
        }
    }, [searchParams, setSearchParams, handleOpenModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVendor) {
                await updateVendor(editingVendor._id, formData);
                toast.success("Vendor updated successfully");
            } else {
                await createVendor(formData);
                toast.success("Vendor created successfully");
            }
            handleCloseModal();
            fetchVendors();
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!vendorToDelete) return;
        try {
            await deleteVendor(vendorToDelete);
            toast.success("Vendor deleted");
            fetchVendors();
        } catch (error) {
            toast.error("Failed to delete vendor");
        } finally {
            setIsDeleteModalOpen(false);
            setVendorToDelete(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setVendorToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Vendor Management</h2>
                        <p className="text-slate-500 text-sm">Manage plumbers, contractors, and service providers.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Vendor
                    </button>
                </header>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by vendor name, company, or email..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Vendors Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Loading vendors...</td>
                                    </tr>
                                ) : filteredVendors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No vendors found</td>
                                    </tr>
                                ) : filteredVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="font-bold text-slate-800">{vendor.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium italic">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {vendor.company}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="h-3 w-3" />
                                                    {vendor.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Mail className="h-3 w-3" />
                                                    {vendor.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(vendor.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all group-hover:shadow-sm">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl border-slate-100">
                                                    <DropdownMenuItem
                                                        onClick={() => handleOpenModal(vendor)}
                                                        className="flex items-center gap-2 py-2 cursor-pointer focus:bg-blue-50 focus:text-blue-600 rounded-lg"
                                                    >
                                                        <Edit2 className="h-4 w-4" /> Edit Vendor
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(vendor._id)}
                                                        className="flex items-center gap-2 py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Delete Vendor
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Vendor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-xl text-slate-900">
                                {editingVendor ? "Edit Vendor" : "New Vendor Profile"}
                            </h3>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Vendor Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                                        placeholder="John Smith"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Company</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                                        placeholder="Elite Plumbing"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                                        placeholder="(555) 123-4567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Notes / Qualifications</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                                    placeholder="Licensed Master Plumber, 24/7 emergency service..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                    {editingVendor ? "Update Vendor" : "Save Vendor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title="Delete Vendor"
                description="Are you sure you want to delete this vendor? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                variant="destructive"
            />
        </AdminLayout>
    );
};

export default Vendors;
