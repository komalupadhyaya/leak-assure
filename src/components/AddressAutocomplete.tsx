import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

interface PhotonFeature {
    properties: {
        name?: string;
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
        state?: string;
        country?: string;
        osm_id?: number;
    };
    geometry: {
        coordinates: [number, number]; // [lon, lat]
    };
}

interface AddressAutocompleteProps {
    value: string;
    onSelect: (address: string, lat?: number, lon?: number) => void;
    placeholder?: string;
    className?: string;
    error?: boolean;
}

export function AddressAutocomplete({
    value,
    onSelect,
    placeholder = "Service Address",
    className = "",
    error = false,
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync query with external value (e.g. when form resets)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced fetch from Photon API
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        // Only fetch if query is different from the selected value
        if (query === value) return;

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
                );
                const data = await response.json();
                setSuggestions(data.features || []);
                setIsOpen(true);
            } catch (error) {
                console.error("Photon API error:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, value]);

    const formatAddress = (feature: PhotonFeature) => {
        const p = feature.properties;
        const parts = [];

        // Build address string: Name/Street Housenumber, City, State, Country
        const streetPart = p.street ? `${p.street}${p.housenumber ? ` ${p.housenumber}` : ''}` : p.name;
        if (streetPart) parts.push(streetPart);
        if (p.city) parts.push(p.city);
        if (p.state) parts.push(p.state);
        if (p.country) parts.push(p.country);

        return parts.join(", ");
    };

    const handleSelect = (feature: PhotonFeature) => {
        const fullAddress = formatAddress(feature);
        const [lon, lat] = feature.geometry.coordinates;

        setQuery(fullAddress);
        setIsOpen(false);
        onSelect(fullAddress, lat, lon);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length < 3) setIsOpen(false);
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className={`${className} pr-10`}
                    autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MapPin className="h-4 w-4" />
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (suggestions.length > 0) && (
                <div className="absolute left-0 right-0 mt-2 z-[1000] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        {suggestions.map((feature, index) => (
                            <button
                                key={`${feature.properties.osm_id}-${index}`}
                                type="button"
                                onClick={() => handleSelect(feature)}
                                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0"
                            >
                                <div className="mt-0.5 h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                                    <MapPin className="h-3 w-3 text-slate-400 group-hover:text-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 leading-tight">
                                        {feature.properties.name || feature.properties.street || "Unnamed Location"}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                                        {[feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(", ")}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Search Results
                        </span>
                        <img
                            src="https://photon.komoot.io/img/logo.png"
                            alt="Photon"
                            className="h-2 opacity-30 grayscale"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
