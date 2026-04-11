import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;

interface AddressAutocompleteProps {
    value: string;
    onSelect: (address: string, components?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        lat: number;
        lng: number;
    }) => void;
    placeholder?: string;
    className?: string;
    error?: boolean;
}

interface Suggestion {
    description: string;
    place_id: string;
}

// Helper to extract address component
function getComponent(result: any, type: string, useShort = false): string {
    const component = result.address_components?.find((c: any) => c.types.includes(type));
    return useShort ? component?.short_name || "" : component?.long_name || "";
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const g = (window as any).google;
        if (g?.maps?.places) { resolve(); return; }
        if (document.getElementById("google-maps-script")) {
            // Script is loading, queue callback
            (window as any).initGooglePlaces = resolve;
            return;
        }
        (window as any).initGooglePlaces = resolve;
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
        script.async = true;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export function AddressAutocomplete({
    value,
    onSelect,
    placeholder = "Service Address",
    className = "",
    error = false,
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);
    const [hasSelected, setHasSelected] = useState(!!value);
    const containerRef = useRef<HTMLDivElement>(null);
    const autocompleteServiceRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync query with external value
    useEffect(() => { 
        setQuery(value); 
        if (value) setHasSelected(true);
    }, [value]);

    // Load Google Maps or skip
    useEffect(() => {
        if (!GOOGLE_API_KEY) return;
        loadGoogleMapsScript(GOOGLE_API_KEY).then(() => {
            const g = (window as any).google;
            autocompleteServiceRef.current = new g.maps.places.AutocompleteService();
            geocoderRef.current = new g.maps.Geocoder();
            setGoogleReady(true);
        }).catch((e: unknown) => console.error("Google Maps failed to load", e));
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                // If the user clicks outside and hasn't selected, clear it (Force selection)
                if (!hasSelected && query !== "") {
                    setQuery("");
                    onSelect("");
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [hasSelected, query, onSelect]);

    const fetchSuggestions = useCallback((input: string) => {
        if (!googleReady || !autocompleteServiceRef.current || input.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        autocompleteServiceRef.current.getPlacePredictions(
            {
                input,
                componentRestrictions: { country: "us" },
                types: ["address"],
            },
            (predictions, status) => {
                setIsLoading(false);
                if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions.map(p => ({ description: p.description, place_id: p.place_id })));
                    setIsOpen(true);
                } else {
                    setSuggestions([]);
                }
            }
        );
    }, [googleReady]);

    useEffect(() => {
        if (query === value) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(query), 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, value, fetchSuggestions]);

    const handleSelect = async (suggestion: Suggestion) => {
        setQuery(suggestion.description);
        setHasSelected(true);
        setIsOpen(false);
        setSuggestions([]);

        if (geocoderRef.current) {
            try {
                const result = await geocoderRef.current.geocode({ placeId: suggestion.place_id });
                if (result.results?.[0]) {
                    const res = result.results[0];
                    const loc = res.geometry.location;
                    const components = {
                        street: `${getComponent(res, "street_number")} ${getComponent(res, "route")}`.trim(),
                        city: getComponent(res, "locality"),
                        state: getComponent(res, "administrative_area_level_1", true),
                        zip: getComponent(res, "postal_code"),
                        country: getComponent(res, "country", true),
                        lat: loc.lat(),
                        lng: loc.lng(),
                    };
                    onSelect(suggestion.description, components);
                    return;
                }
            } catch { /* fall through */ }
        }
        onSelect(suggestion.description);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setHasSelected(false);
                        if (e.target.value.length < 3) setIsOpen(false);
                    }}
                    onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
                    onBlur={() => {
                        // Small delay to allow click on suggestion
                        setTimeout(() => {
                            if (!hasSelected && query !== "") {
                                setQuery("");
                                onSelect("");
                            }
                        }, 200);
                    }}
                    placeholder={placeholder}
                    className={`${className} pr-10`}
                    autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                </div>
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 z-[1000] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        {suggestions.map((s) => (
                            <button
                                key={s.place_id}
                                type="button"
                                onClick={() => handleSelect(s)}
                                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0"
                            >
                                <div className="mt-0.5 h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                                    <MapPin className="h-3 w-3 text-slate-400 group-hover:text-blue-500" />
                                </div>
                                <span className="text-sm text-slate-800 leading-snug">{s.description}</span>
                            </button>
                        ))}
                    </div>
                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Powered by Google · U.S. Addresses Only
                        </span>
                    </div>
                </div>
            )}

            {!GOOGLE_API_KEY && (
                <p className="mt-1 text-[10px] text-amber-600 font-medium">
                    ⚠ Add VITE_GOOGLE_PLACES_API_KEY to .env for address autocomplete.
                </p>
            )}
        </div>
    );
}
