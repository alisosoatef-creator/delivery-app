export const LOCAL_WEST_BANK_PLACES = [
  { id: "nablus_an_najah", label: "جامعة النجاح", city: "nablus", lat: 32.2267, lng: 35.2222, category: "جامعة" },
  { id: "nablus_rafidia", label: "رفيديا", city: "nablus", lat: 32.2216, lng: 35.2366, category: "حي" },
  { id: "nablus_dowar", label: "الدوار", city: "nablus", lat: 32.2211, lng: 35.2544, category: "معلم" },
  { id: "nablus_center", label: "وسط البلد", city: "nablus", lat: 32.2206, lng: 35.2621, category: "مركز" },
  { id: "ramallah_manara", label: "المنارة", city: "ramallah", lat: 31.9046, lng: 35.2045, category: "معلم" },
  { id: "ramallah_ersal", label: "الإرسال", city: "ramallah", lat: 31.9142, lng: 35.2049, category: "حي" },
  { id: "ramallah_masyoun", label: "المصيون", city: "ramallah", lat: 31.9101, lng: 35.1959, category: "حي" },
  { id: "hebron_ein_sara", label: "عين سارة", city: "hebron", lat: 31.5439, lng: 35.0998, category: "حي" },
  { id: "hebron_center", label: "وسط البلد", city: "hebron", lat: 31.5326, lng: 35.0998, category: "مركز" },
  { id: "jenin_center", label: "وسط البلد", city: "jenin", lat: 32.4594, lng: 35.3009, category: "مركز" },
  { id: "tulkarm_center", label: "وسط البلد", city: "tulkarm", lat: 32.3104, lng: 35.0286, category: "مركز" },
  { id: "bethlehem_manger", label: "ساحة المهد", city: "bethlehem", lat: 31.7044, lng: 35.2076, category: "معلم" },
  { id: "qalqilya_center", label: "وسط البلد", city: "qalqilya", lat: 32.196, lng: 34.9812, category: "مركز" },
  { id: "jericho_center", label: "وسط البلد", city: "jericho", lat: 31.856, lng: 35.4689, category: "مركز" },
  { id: "salfit_center", label: "وسط البلد", city: "salfit", lat: 32.0837, lng: 35.1808, category: "مركز" },
  { id: "tubas_center", label: "وسط البلد", city: "tubas", lat: 32.3209, lng: 35.3699, category: "مركز" }
];

function normalizeSearch(value) {
  return String(value || "").trim().toLowerCase();
}

export function searchFallbackPlaces({ city = "", q = "", limit = 6 } = {}) {
  const cityId = normalizeSearch(city);
  const query = normalizeSearch(q);
  const cityPlaces = LOCAL_WEST_BANK_PLACES.filter((place) => !cityId || place.city === cityId);
  const matches = query
    ? cityPlaces.filter((place) => normalizeSearch(`${place.label} ${place.category}`).includes(query))
    : cityPlaces;

  return matches.slice(0, limit).map((place) => ({ ...place, source: "local-fallback" }));
}
