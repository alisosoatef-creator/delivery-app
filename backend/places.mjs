const LOCAL_PLACES = [
  { id: "nablus_an_najah", label: "جامعة النجاح", city: "nablus", lat: 32.2267, lng: 35.2222, category: "university" },
  { id: "nablus_rafidia", label: "رفيديا", city: "nablus", lat: 32.2216, lng: 35.2366, category: "district" },
  { id: "nablus_dowar", label: "الدوار", city: "nablus", lat: 32.2211, lng: 35.2544, category: "landmark" },
  { id: "nablus_center", label: "وسط البلد", city: "nablus", lat: 32.2206, lng: 35.2621, category: "center" },
  { id: "ramallah_manara", label: "المنارة", city: "ramallah", lat: 31.9046, lng: 35.2045, category: "landmark" },
  { id: "ramallah_ersal", label: "الإرسال", city: "ramallah", lat: 31.9142, lng: 35.2049, category: "district" },
  { id: "ramallah_masyoun", label: "المصيون", city: "ramallah", lat: 31.9101, lng: 35.1959, category: "district" },
  { id: "hebron_ein_sara", label: "عين سارة", city: "hebron", lat: 31.5439, lng: 35.0998, category: "district" },
  { id: "hebron_center", label: "وسط البلد", city: "hebron", lat: 31.5326, lng: 35.0998, category: "center" },
  { id: "jenin_center", label: "وسط البلد", city: "jenin", lat: 32.4594, lng: 35.3009, category: "center" },
  { id: "tulkarm_center", label: "وسط البلد", city: "tulkarm", lat: 32.3104, lng: 35.0286, category: "center" },
  { id: "bethlehem_manger", label: "ساحة المهد", city: "bethlehem", lat: 31.7044, lng: 35.2076, category: "landmark" },
  { id: "qalqilya_center", label: "وسط البلد", city: "qalqilya", lat: 32.196, lng: 34.9812, category: "center" },
  { id: "jericho_center", label: "وسط البلد", city: "jericho", lat: 31.856, lng: 35.4689, category: "center" },
  { id: "salfit_center", label: "وسط البلد", city: "salfit", lat: 32.0837, lng: 35.1808, category: "center" },
  { id: "tubas_center", label: "وسط البلد", city: "tubas", lat: 32.3209, lng: 35.3699, category: "center" }
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function searchLocalPlaces({ city = "", q = "", limit = 8 } = {}) {
  const cityId = normalize(city);
  const query = normalize(q);
  const scopedPlaces = LOCAL_PLACES.filter((place) => !cityId || place.city === cityId);
  const matches = query
    ? scopedPlaces.filter((place) =>
        normalize(`${place.label} ${place.city} ${place.category}`).includes(query)
      )
    : scopedPlaces;

  return matches.slice(0, limit).map((place) => ({ ...place, source: "local-fallback" }));
}
