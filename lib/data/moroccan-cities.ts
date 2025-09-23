export interface MoroccanCity {
  id: string;
  name: string;
  region: string;
  population: number;
  economicImportance: 'high' | 'medium' | 'low';
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
}

export const moroccanCities: MoroccanCity[] = [
  // Economic Hub - Casablanca Region
  {
    id: 'casablanca',
    name: 'Casablanca',
    region: 'Casablanca-Settat',
    population: 3359818,
    economicImportance: 'high',
    coordinates: { lat: 33.5731, lng: -7.5898 },
    description: 'Centre économique et financier du Maroc, plus grande ville du pays'
  },

  // Capital - Rabat-Salé Region
  {
    id: 'rabat',
    name: 'Rabat',
    region: 'Rabat-Salé-Kénitra',
    population: 577827,
    economicImportance: 'high',
    coordinates: { lat: 34.0209, lng: -6.8416 },
    description: 'Capitale politique et administrative du royaume'
  },
  {
    id: 'sale',
    name: 'Salé',
    region: 'Rabat-Salé-Kénitra',
    population: 890403,
    economicImportance: 'medium',
    coordinates: { lat: 34.0531, lng: -6.7985 },
    description: 'Ville historique jumelle de Rabat'
  },
  {
    id: 'kenitra',
    name: 'Kénitra',
    region: 'Rabat-Salé-Kénitra',
    population: 431282,
    economicImportance: 'medium',
    coordinates: { lat: 34.2610, lng: -6.5802 },
    description: 'Centre industriel et portuaire important'
  },

  // Cultural Capital - Fès Region
  {
    id: 'fes',
    name: 'Fès',
    region: 'Fès-Meknès',
    population: 1112072,
    economicImportance: 'high',
    coordinates: { lat: 34.0181, lng: -5.0078 },
    description: 'Capitale spirituelle et culturelle, patrimoine UNESCO'
  },
  {
    id: 'meknes',
    name: 'Meknès',
    region: 'Fès-Meknès',
    population: 632079,
    economicImportance: 'medium',
    coordinates: { lat: 33.8935, lng: -5.5473 },
    description: 'Ville impériale, centre agricole important'
  },

  // Tourism Hub - Marrakech Region
  {
    id: 'marrakech',
    name: 'Marrakech',
    region: 'Marrakech-Safi',
    population: 928850,
    economicImportance: 'high',
    coordinates: { lat: 31.6295, lng: -7.9811 },
    description: 'Capitale touristique, ville impériale emblématique'
  },
  {
    id: 'safi',
    name: 'Safi',
    region: 'Marrakech-Safi',
    population: 308508,
    economicImportance: 'medium',
    coordinates: { lat: 32.2994, lng: -9.2372 },
    description: 'Port atlantique, industrie chimique et céramique'
  },

  // Northern Economic Centers
  {
    id: 'tangier',
    name: 'Tanger',
    region: 'Tanger-Tétouan-Al Hoceïma',
    population: 947952,
    economicImportance: 'high',
    coordinates: { lat: 35.7595, lng: -5.8340 },
    description: 'Porte de l\'Afrique, hub logistique méditerranéen'
  },
  {
    id: 'tetouan',
    name: 'Tétouan',
    region: 'Tanger-Tétouan-Al Hoceïma',
    population: 380787,
    economicImportance: 'medium',
    coordinates: { lat: 35.5889, lng: -5.3626 },
    description: 'Patrimoine andalou, proximité de l\'Europe'
  },
  {
    id: 'al-hoceima',
    name: 'Al Hoceïma',
    region: 'Tanger-Tétouan-Al Hoceïma',
    population: 56716,
    economicImportance: 'low',
    coordinates: { lat: 35.2517, lng: -3.9372 },
    description: 'Station balnéaire méditerranéenne'
  },

  // Eastern Morocco
  {
    id: 'oujda',
    name: 'Oujda',
    region: 'L\'Oriental',
    population: 494252,
    economicImportance: 'medium',
    coordinates: { lat: 34.6814, lng: -1.9086 },
    description: 'Porte orientale, commerce transfrontalier'
  },
  {
    id: 'nador',
    name: 'Nador',
    region: 'L\'Oriental',
    population: 161726,
    economicImportance: 'medium',
    coordinates: { lat: 35.1681, lng: -2.9287 },
    description: 'Port méditerranéen, industrie métallurgique'
  },

  // Atlantic Coast
  {
    id: 'el-jadida',
    name: 'El Jadida',
    region: 'Casablanca-Settat',
    population: 194934,
    economicImportance: 'medium',
    coordinates: { lat: 33.2316, lng: -8.5007 },
    description: 'Port atlantique, patrimoine portugais'
  },
  {
    id: 'mohammedia',
    name: 'Mohammedia',
    region: 'Casablanca-Settat',
    population: 208612,
    economicImportance: 'medium',
    coordinates: { lat: 33.6866, lng: -7.3674 },
    description: 'Centre pétrolier et industriel'
  },

  // Central Morocco
  {
    id: 'beni-mellal',
    name: 'Béni Mellal',
    region: 'Béni Mellal-Khénifra',
    population: 192676,
    economicImportance: 'medium',
    coordinates: { lat: 32.3373, lng: -6.3498 },
    description: 'Centre agricole, plaines fertiles'
  },
  {
    id: 'khenifra',
    name: 'Khénifra',
    region: 'Béni Mellal-Khénifra',
    population: 86388,
    economicImportance: 'low',
    coordinates: { lat: 32.9355, lng: -5.6681 },
    description: 'Centre montagnard, élevage et foresterie'
  },

  // Southern Morocco
  {
    id: 'agadir',
    name: 'Agadir',
    region: 'Souss-Massa',
    population: 421844,
    economicImportance: 'high',
    coordinates: { lat: 30.4278, lng: -9.5981 },
    description: 'Capital touristique du sud, port de pêche'
  },
  {
    id: 'tiznit',
    name: 'Tiznit',
    region: 'Souss-Massa',
    population: 74699,
    economicImportance: 'low',
    coordinates: { lat: 29.6974, lng: -9.7316 },
    description: 'Artisanat berbère, bijouterie traditionnelle'
  },

  // Saharan Regions
  {
    id: 'laayoune',
    name: 'Laâyoune',
    region: 'Laâyoune-Sakia El Hamra',
    population: 271062,
    economicImportance: 'medium',
    coordinates: { lat: 27.1536, lng: -13.2033 },
    description: 'Capitale du Sahara marocain, phosphates'
  },
  {
    id: 'dakhla',
    name: 'Dakhla',
    region: 'Dakhla-Oued Ed-Dahab',
    population: 106277,
    economicImportance: 'medium',
    coordinates: { lat: 23.7185, lng: -15.9570 },
    description: 'Pêche maritime, développement touristique'
  },

  // Mountain Regions
  {
    id: 'errachidia',
    name: 'Errachidia',
    region: 'Drâa-Tafilalet',
    population: 92374,
    economicImportance: 'low',
    coordinates: { lat: 31.9314, lng: -4.4316 },
    description: 'Porte du désert, oasis et palmeraies'
  },
  {
    id: 'ouarzazate',
    name: 'Ouarzazate',
    region: 'Drâa-Tafilalet',
    population: 71067,
    economicImportance: 'medium',
    coordinates: { lat: 30.9189, lng: -6.8934 },
    description: 'Hollywood de l\'Afrique, énergie solaire'
  }
];

export const moroccanRegions = [
  'Casablanca-Settat',
  'Rabat-Salé-Kénitra',
  'Fès-Meknès',
  'Marrakech-Safi',
  'Tanger-Tétouan-Al Hoceïma',
  'L\'Oriental',
  'Béni Mellal-Khénifra',
  'Souss-Massa',
  'Laâyoune-Sakia El Hamra',
  'Dakhla-Oued Ed-Dahab',
  'Drâa-Tafilalet',
  'Guelmim-Oued Noun'
];

export const getHighPriorityCities = () =>
  moroccanCities.filter(city => city.economicImportance === 'high');

export const getCitiesByRegion = (region: string) =>
  moroccanCities.filter(city => city.region === region);