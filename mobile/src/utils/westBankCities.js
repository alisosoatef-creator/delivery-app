export const westBankCities = [
  { id: "nablus", arName: "نابلس", lat: 32.2211, lng: 35.2544 },
  { id: "ramallah", arName: "رام الله", lat: 31.9038, lng: 35.2034 },
  { id: "hebron", arName: "الخليل", lat: 31.5326, lng: 35.0998 },
  { id: "jenin", arName: "جنين", lat: 32.4594, lng: 35.3009 },
  { id: "tulkarm", arName: "طولكرم", lat: 32.3104, lng: 35.0286 },
  { id: "bethlehem", arName: "بيت لحم", lat: 31.7054, lng: 35.2024 },
  { id: "qalqilya", arName: "قلقيلية", lat: 32.196, lng: 34.9812 },
  { id: "jericho", arName: "أريحا", lat: 31.856, lng: 35.4689 },
  { id: "salfit", arName: "سلفيت", lat: 32.0837, lng: 35.1808 },
  { id: "tubas", arName: "طوباس", lat: 32.3209, lng: 35.3699 }
];

export function getCityCenter(cityId = "nablus") {
  return westBankCities.find((city) => city.id === cityId) || westBankCities[0];
}

export function cityOptions() {
  return westBankCities.map((city) => ({ label: city.arName, value: city.id }));
}
