import React, { useState, useEffect } from 'react';
import {
  searchHealthcarePlacesApi,
  getSpecialtiesApi,
} from '../api/healthcare';
import {
  Compass,
  MapPin,
  Hospital,
  Pill,
  Activity,
  PhoneCall,
  Navigation,
  Search,
  Clock,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HealthFinder() {
  const { t } = useLanguage();
  const [category, setCategory] = useState('hospital');
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('');
  const [places, setPlaces] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bloodGroup, setBloodGroup] = useState('O+');

  const categories = [
    { key: 'hospital', label: '🏥 Hospitals', icon: Hospital },
    { key: 'emergency', label: '🚨 24/7 Emergency', icon: Hospital },
    { key: 'pharmacy', label: '💊 Medical Shops / Pharmacy', icon: Pill },
    { key: 'jan', label: '🏷️ Jan Aushadhi (Generics)', icon: Pill },
    { key: 'clinic', label: '🩺 Clinics', icon: Activity },
    { key: 'lab', label: '🧪 Diagnostic Labs', icon: Activity },
    { key: 'blood', label: '🩸 Blood Availability', icon: Hospital },
  ];

  const fetchPlaces = async (cat = category, loc = location) => {
    setLoading(true);
    try {
      const lat = loc ? loc.lat : null;
      const lon = loc ? loc.lon : null;
      const data = await searchHealthcarePlacesApi(cat === 'blood' ? 'hospital' : cat, lat, lon);
      setPlaces(data);
    } catch (err) {
      // Fallback places handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSpecialtiesApi()
      .then((s) => setSpecialties(s))
      .catch(() => {});
    fetchPlaces('hospital', null);
  }, []);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation is not supported in this browser. Showing central facilities.');
      return;
    }
    setLocStatus('Obtaining your current GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(coords);
        setLocStatus('📍 Location acquired! Showing verified nearby facilities sorted by distance.');
        fetchPlaces(category, coords);
      },
      () => {
        setLocStatus('Location permission denied or unavailable. Standard city healthcare results active.');
        fetchPlaces(category, null);
      },
      { timeout: 10000 }
    );
  };

  const handleCategorySelect = (catKey) => {
    setCategory(catKey);
    fetchPlaces(catKey, location);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title & Location Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('nearby')} & Facility Locator</h2>
            <p className="text-xs text-slate-500">Live OpenStreetMap facility search with directions and phone contacts</p>
          </div>
        </div>

        <button
          onClick={handleUseLocation}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
        >
          <MapPin className="w-4 h-4" />
          <span>📍 Use My Location</span>
        </button>
      </div>

      {locStatus && (
        <div className="p-3 bg-pink-50 text-pink-800 text-xs font-semibold rounded-2xl border border-pink-200">
          {locStatus}
        </div>
      )}

      {/* Category Pills Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => handleCategorySelect(c.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              category === c.key
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                : 'bg-white border border-pink-100 text-slate-600 hover:bg-pink-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {category === 'blood' && (
        <section className="glass-card p-5 border-l-4 border-l-rose-500 space-y-3">
          <h3 className="text-sm font-bold text-slate-800">🩸 Emergency Blood Bank Finder</h3>
          <label className="block text-xs font-semibold text-slate-600">Select required blood group</label>
          <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full max-w-xs bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm">
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
          </select>
          <p className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">Urgent request: {bloodGroup}. This prototype lists nearby hospitals, but it does not have a verified live blood-bank inventory feed. Availability must be confirmed by calling the hospital before travelling.</p>
        </section>
      )}

      {/* Facilities Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
          <span>Verified Facilities Nearby</span>
          <span className="text-xs font-normal text-slate-400">{places.length} places found</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
            <span>Searching OpenStreetMap facilities...</span>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">No facilities found nearby.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((p) => (
              <div key={p.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>
                    {p.distance_km !== null && (
                      <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full shrink-0">
                        {p.distance_km} km
                      </span>
                    )}
                  </div>

                  {p.has_emergency && (
                    <span className="inline-block text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full mt-1">
                      🚨 24/7 Emergency Dept
                    </span>
                  )}
                  {category === 'blood' && (
                    <span className="inline-block text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded-full mt-1">🩸 {bloodGroup}: call to confirm</span>
                  )}

                  {p.address && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">📍 {p.address}</p>
                  )}
                  {p.opening_hours && (
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{p.opening_hours}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-pink-50">
                  <a
                    href={p.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-white text-[11px] font-bold shadow-xs hover:bg-slate-900 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-pink-400" />
                    <span>Directions</span>
                  </a>

                  {p.phone && (
                    <a
                      href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-pink-200 text-pink-700 hover:bg-pink-50 text-[11px] font-bold transition-colors"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specialties Quick Finder */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Find Doctors by Clinical Specialty</h3>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s, i) => (
            <a
              key={i}
              href={`https://www.google.com/maps/search/${encodeURIComponent(s.search_query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              👨‍⚕️ {s.name}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
