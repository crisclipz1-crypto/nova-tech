/**
 * Departamentos y municipios de cobertura. El checkout obliga a elegir de esta
 * lista en vez de dejar un campo libre: así la operación logística recibe
 * siempre nombres normalizados y se puede filtrar/exportar sin limpiar datos.
 */
export const COLOMBIA: Record<string, string[]> = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": [
    "Medellín",
    "Bello",
    "Itagüí",
    "Envigado",
    "Sabaneta",
    "Rionegro",
    "Apartadó",
    "Turbo",
    "Caucasia",
  ],
  "Arauca": ["Arauca", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá"],
  "Caldas": ["Manizales", "La Dorada", "Chinchiná", "Villamaría"],
  "Caquetá": ["Florencia", "San Vicente del Caguán"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada"],
  "Cesar": ["Valledupar", "Aguachica", "Agustín Codazzi"],
  "Chocó": ["Quibdó", "Istmina"],
  "Córdoba": ["Montería", "Lorica", "Cereté", "Sahagún"],
  "Cundinamarca": [
    "Soacha",
    "Zipaquirá",
    "Facatativá",
    "Chía",
    "Fusagasugá",
    "Madrid",
    "Mosquera",
    "Girardot",
    "Cajicá",
  ],
  "Bogotá D.C.": ["Bogotá D.C."],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare"],
  "Huila": ["Neiva", "Pitalito", "Garzón"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación"],
  "Meta": ["Villavicencio", "Acacías", "Granada"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Villa del Rosario", "Pamplona"],
  "Putumayo": ["Mocoa", "Puerto Asís"],
  "Quindío": ["Armenia", "Calarcá", "Montenegro"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"],
  "Sucre": ["Sincelejo", "Corozal", "San Marcos"],
  "Tolima": ["Ibagué", "Espinal", "Melgar"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Jamundí", "Yumbo"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"],
};

export const DEPARTMENTS = Object.keys(COLOMBIA).sort((a, b) =>
  a.localeCompare(b, "es")
);

export function citiesOf(department: string): string[] {
  return COLOMBIA[department] ?? [];
}

/** Valida que la pareja departamento/ciudad exista realmente. */
export function isValidLocation(department: string, city: string) {
  return citiesOf(department).includes(city);
}
