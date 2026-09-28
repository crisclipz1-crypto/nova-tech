/**
 * Datos de ejemplo para NOVA TECH.
 *
 *   npm run db:seed
 *
 * Es idempotente: limpia las tablas y vuelve a sembrarlas, de modo que se puede
 * ejecutar tantas veces como haga falta durante el desarrollo.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL");

const db = new PrismaClient({
  adapter: url.startsWith("file:")
    ? new PrismaBetterSqlite3({ url })
    : new PrismaPg({ connectionString: url }),
});

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const IMAGES = {
  headphonesBlack: img("1505740420928-5e560c06d30e"),
  headphonesWhite: img("1484704849700-f032a568e944"),
  headphonesStudio: img("1606220945770-b5b6c2c55bf1"),
  headphonesDetail: img("1583394838336-acd977736f90"),
  earbuds: img("1572569511254-d8f925fe2cbb"),
  speaker: img("1608043152269-423dbba4e7e1"),
  laptopOpen: img("1496181133206-80ce9b88a853"),
  laptopDesk: img("1517336714731-489689fd1ca8"),
  laptopSide: img("1593642702821-c8da6771f0c6"),
  monitor: img("1527864550417-7fd91fc51a46"),
  keyboard: img("1587829741301-dc798b83add3"),
  mouse: img("1527814050087-3793815479db"),
  phoneFront: img("1511707171634-5f897ff02aa9"),
  phoneBack: img("1592750475338-74b7b21085ab"),
  phoneHand: img("1610945265064-0e34e5519bbf"),
  watch: img("1523275335684-37898b6baf30"),
  watchSmart: img("1546868871-7041f2a55e12"),
  band: img("1575311373937-040b8e1fd5b6"),
  powerbank: img("1603539444875-76e7684265f6"),
  charger: img("1625842268584-8f3296236761"),
  hub: img("1588872657578-7efd1f1555ed"),
  case: img("1541807084-5c52b6b3adef"),
  camera: img("1558002038-1055907df827"),
  bulb: img("1526738549149-8e07eca6c147"),
  flatlay: img("1550009158-9ebf69173e03"),
  desk: img("1531297484001-80022131f5a1"),
  gear: img("1498049794561-7780e7231661"),
  workspace: img("1468495244123-6c6c332eeece"),
  phoneHero: img("1600294037681-c80b4cb5b434"),
};

type SeedProduct = {
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  brand: string;
  stock: number;
  category: string;
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  badge?: string;
  views: number;
  unitsSold: number;
  active?: boolean;
  specs: { label: string; value: string }[];
  images: { url: string; alt: string }[];
  variants?: {
    group: string;
    label: string;
    value: string;
    hex?: string;
    priceDelta?: number;
    stock: number;
  }[];
};

const CATEGORIES = [
  {
    name: "Audio",
    slug: "audio",
    icon: "Headphones",
    description: "Audífonos, earbuds y parlantes con sonido de estudio.",
    image: IMAGES.headphonesStudio,
  },
  {
    name: "Cómputo",
    slug: "computo",
    icon: "Laptop",
    description: "Portátiles, monitores y periféricos para trabajar y jugar.",
    image: IMAGES.laptopDesk,
  },
  {
    name: "Smartphones",
    slug: "smartphones",
    icon: "Smartphone",
    description: "Teléfonos desbloqueados con garantía de 12 meses.",
    image: IMAGES.phoneHero,
  },
  {
    name: "Wearables",
    slug: "wearables",
    icon: "Watch",
    description: "Relojes y bandas que miden todo lo que te importa.",
    image: IMAGES.watchSmart,
  },
  {
    name: "Accesorios",
    slug: "accesorios",
    icon: "Cable",
    description: "Carga, conectividad y protección para tus equipos.",
    image: IMAGES.flatlay,
  },
  {
    name: "Smart Home",
    slug: "smart-home",
    icon: "House",
    description: "Cámaras, luces y sensores para una casa que se cuida sola.",
    image: IMAGES.bulb,
  },
];

const PRODUCTS: SeedProduct[] = [
  // --------------------------------------------------------------- Audio ---
  {
    name: "Nova Pulse Pro",
    slug: "nova-pulse-pro",
    summary: "Audífonos over-ear con cancelación activa y 40 h de batería.",
    description:
      "Los Pulse Pro son nuestro tope de gama. Cancelación activa híbrida con seis micrófonos que apaga el ruido del bus, la oficina o el avión sin que pierdas detalle en la música. Los drivers de 40 mm entregan graves con cuerpo y voces limpias, y las almohadillas de espuma viscoelástica aguantan jornadas largas sin molestar.\n\nLa batería rinde 40 horas con ANC encendido y 60 sin él. Una carga rápida de 10 minutos te da 6 horas más. Se conectan a dos equipos a la vez: contestas una llamada en el celular sin desconectar el portátil.",
    price: 459900,
    compareAtPrice: 599900,
    sku: "NVA-AUD-001",
    brand: "Nova",
    stock: 34,
    category: "audio",
    featured: true,
    bestSeller: true,
    badge: "Más vendido",
    views: 4820,
    unitsSold: 312,
    specs: [
      { label: "Drivers", value: "40 mm dinámicos" },
      { label: "Batería", value: "40 h con ANC · 60 h sin ANC" },
      { label: "Carga rápida", value: "10 min = 6 h" },
      { label: "Bluetooth", value: "5.3 con multipunto" },
      { label: "Códecs", value: "SBC, AAC, LDAC" },
      { label: "Peso", value: "268 g" },
    ],
    images: [
      { url: IMAGES.headphonesBlack, alt: "Nova Pulse Pro en negro" },
      { url: IMAGES.headphonesStudio, alt: "Nova Pulse Pro sobre mesa de estudio" },
      { url: IMAGES.headphonesDetail, alt: "Detalle de las almohadillas" },
      { url: IMAGES.headphonesWhite, alt: "Nova Pulse Pro en blanco" },
    ],
    variants: [
      { group: "color", label: "Color", value: "Negro medianoche", hex: "#141414", stock: 18 },
      { group: "color", label: "Color", value: "Blanco hueso", hex: "#EDE9E3", stock: 11 },
      { group: "color", label: "Color", value: "Azul cobalto", hex: "#2563EB", stock: 5 },
    ],
  },
  {
    name: "Nova Buds Air",
    slug: "nova-buds-air",
    summary: "Earbuds TWS con ANC adaptativo y estuche de carga inalámbrica.",
    description:
      "Pesan 4,2 gramos cada uno y desaparecen en la oreja. El ANC adaptativo mide el ruido de tu entorno 200 veces por segundo y ajusta la cancelación sobre la marcha, así que no tienes que estar cambiando de modo.\n\nResistencia IPX5: aguantan sudor y lluvia. Con el estuche suman 28 horas de reproducción y se cargan en cualquier base inalámbrica Qi.",
    price: 219900,
    compareAtPrice: 289900,
    sku: "NVA-AUD-002",
    brand: "Nova",
    stock: 52,
    category: "audio",
    bestSeller: true,
    views: 3910,
    unitsSold: 268,
    specs: [
      { label: "Batería", value: "7 h + 21 h con estuche" },
      { label: "Resistencia", value: "IPX5" },
      { label: "Carga", value: "USB-C y Qi inalámbrica" },
      { label: "Bluetooth", value: "5.3" },
      { label: "Peso", value: "4,2 g por audífono" },
    ],
    images: [
      { url: IMAGES.earbuds, alt: "Nova Buds Air con su estuche" },
      { url: IMAGES.headphonesDetail, alt: "Detalle de los Nova Buds Air" },
    ],
    variants: [
      { group: "color", label: "Color", value: "Negro", hex: "#141414", stock: 30 },
      { group: "color", label: "Color", value: "Blanco", hex: "#F5F5F4", stock: 22 },
    ],
  },
  {
    name: "Nova Boom",
    slug: "nova-boom",
    summary: "Parlante bluetooth IPX7 de 30 W que suena más de lo que mide.",
    description:
      "Un cilindro de 18 cm con dos radiadores pasivos y 30 W reales. Flota, aguanta inmersión de 30 minutos y se empareja con otro Boom para sonido estéreo en fiestas.\n\nDoce horas de batería y puerto USB-C que además sirve para cargar tu celular en una emergencia.",
    price: 179900,
    sku: "NVA-AUD-003",
    brand: "Nova",
    stock: 41,
    category: "audio",
    isNew: true,
    views: 1740,
    unitsSold: 96,
    specs: [
      { label: "Potencia", value: "30 W RMS" },
      { label: "Batería", value: "12 h" },
      { label: "Resistencia", value: "IPX7 (flota)" },
      { label: "Emparejamiento", value: "Estéreo con dos unidades" },
    ],
    images: [
      { url: IMAGES.speaker, alt: "Parlante Nova Boom" },
      { url: IMAGES.flatlay, alt: "Nova Boom junto a otros accesorios" },
    ],
    variants: [
      { group: "color", label: "Color", value: "Grafito", hex: "#2E2E2E", stock: 24 },
      { group: "color", label: "Color", value: "Arena", hex: "#C8B79B", stock: 17 },
    ],
  },
  {
    name: "Nova Studio Monitor",
    slug: "nova-studio-monitor",
    summary: "Audífonos abiertos de referencia para mezcla y edición.",
    description:
      "Respuesta plana de 10 Hz a 40 kHz y cámara acústica abierta: escuchas la mezcla como es, no como el audífono quiere que sea. Cable desmontable de 3 m con conector de bloqueo y adaptador de 6,3 mm incluido.\n\nNo llevan bluetooth ni cancelación a propósito: cada circuito de más es ruido de menos en el monitoreo.",
    price: 389900,
    compareAtPrice: 459900,
    sku: "NVA-AUD-004",
    brand: "Nova",
    stock: 12,
    category: "audio",
    views: 980,
    unitsSold: 41,
    specs: [
      { label: "Tipo", value: "Over-ear abierto" },
      { label: "Respuesta", value: "10 Hz – 40 kHz" },
      { label: "Impedancia", value: "38 Ω" },
      { label: "Cable", value: "Desmontable 3 m + adaptador 6,3 mm" },
    ],
    images: [
      { url: IMAGES.headphonesWhite, alt: "Nova Studio Monitor" },
      { url: IMAGES.headphonesStudio, alt: "Nova Studio Monitor en el escritorio" },
    ],
  },

  // ------------------------------------------------------------- Cómputo ---
  {
    name: "Nova Book Air 14",
    slug: "nova-book-air-14",
    summary: "Portátil de 1,2 kg con pantalla 2.8K, 16 GB de RAM y 512 GB SSD.",
    description:
      "Chasis unibody de aluminio de 15,9 mm y 1,2 kg. La pantalla de 14 pulgadas es un panel OLED 2880×1800 a 90 Hz con cobertura del 100 % DCI-P3: colores correctos para editar, negros reales para ver series.\n\nDentro lleva 16 GB de RAM LPDDR5 y un SSD NVMe de 512 GB. La batería de 70 Wh aguanta una jornada completa de trabajo y carga al 50 % en 30 minutos por USB-C.",
    price: 3299000,
    compareAtPrice: 3799000,
    sku: "NVA-CMP-001",
    brand: "Nova",
    stock: 9,
    category: "computo",
    featured: true,
    bestSeller: true,
    badge: "Descuento de Temporada",
    views: 6240,
    unitsSold: 87,
    specs: [
      { label: "Pantalla", value: "14\" OLED 2880×1800 @ 90 Hz" },
      { label: "Memoria", value: "16 GB LPDDR5" },
      { label: "Almacenamiento", value: "512 GB NVMe" },
      { label: "Batería", value: "70 Wh · carga rápida USB-C" },
      { label: "Puertos", value: "2× USB-C, 1× USB-A, HDMI, jack 3,5 mm" },
      { label: "Peso", value: "1,2 kg" },
    ],
    images: [
      { url: IMAGES.laptopOpen, alt: "Nova Book Air 14 abierto" },
      { url: IMAGES.laptopDesk, alt: "Nova Book Air sobre un escritorio" },
      { url: IMAGES.laptopSide, alt: "Perfil del Nova Book Air" },
    ],
    variants: [
      { group: "almacenamiento", label: "Almacenamiento", value: "512 GB", stock: 9 },
      { group: "almacenamiento", label: "Almacenamiento", value: "1 TB", priceDelta: 450000, stock: 4 },
      { group: "color", label: "Color", value: "Plata", hex: "#D9D9D9", stock: 7 },
      { group: "color", label: "Color", value: "Gris espacial", hex: "#4A4A4A", stock: 6 },
    ],
  },
  {
    name: "Nova View 27 4K",
    slug: "nova-view-27-4k",
    summary: "Monitor IPS 4K de 27\" con USB-C de 90 W y base ergonómica.",
    description:
      "Panel IPS 4K de 27 pulgadas con 99 % sRGB y fábrica calibrado a ΔE < 2. Un solo cable USB-C lleva imagen, datos y 90 W de carga al portátil: conectas uno y el escritorio queda limpio.\n\nLa base sube, baja, gira y pivota a vertical. Incluye soporte VESA 100×100 si prefieres brazo.",
    price: 1249000,
    sku: "NVA-CMP-002",
    brand: "Nova",
    stock: 15,
    category: "computo",
    views: 2150,
    unitsSold: 64,
    specs: [
      { label: "Panel", value: "IPS 27\" 3840×2160 @ 60 Hz" },
      { label: "Color", value: "99 % sRGB · ΔE < 2" },
      { label: "Conectividad", value: "USB-C 90 W, 2× HDMI 2.0, DisplayPort" },
      { label: "Ergonomía", value: "Altura, giro, inclinación y pivote" },
    ],
    images: [
      { url: IMAGES.monitor, alt: "Monitor Nova View 27 4K" },
      { url: IMAGES.workspace, alt: "Nova View en un espacio de trabajo" },
    ],
  },
  {
    name: "Nova K75 Mecánico",
    slug: "nova-k75-mecanico",
    summary: "Teclado mecánico 75 % hot-swap, inalámbrico y en español.",
    description:
      "Distribución 75 % en español latinoamericano —con la Ñ donde debe estar— montada en gasket sobre espuma, que es lo que le da ese sonido sordo y agradable al escribir.\n\nSwitches hot-swap: los cambias sin soldar. Tres modos de conexión (cable USB-C, bluetooth para tres equipos y receptor de 2,4 GHz) y retroiluminación blanca regulable.",
    price: 329900,
    compareAtPrice: 389900,
    sku: "NVA-CMP-003",
    brand: "Nova",
    stock: 27,
    category: "computo",
    isNew: true,
    views: 1890,
    unitsSold: 73,
    specs: [
      { label: "Formato", value: "75 % · español latinoamericano" },
      { label: "Switches", value: "Hot-swap de 5 pines" },
      { label: "Conexión", value: "USB-C, Bluetooth 5.1 (3 equipos), 2,4 GHz" },
      { label: "Batería", value: "4000 mAh" },
    ],
    images: [
      { url: IMAGES.keyboard, alt: "Teclado mecánico Nova K75" },
      { url: IMAGES.desk, alt: "Nova K75 en el escritorio" },
    ],
    variants: [
      { group: "switch", label: "Switch", value: "Lineal (rojo)", stock: 12 },
      { group: "switch", label: "Switch", value: "Táctil (café)", stock: 10 },
      { group: "switch", label: "Switch", value: "Clicky (azul)", stock: 5 },
    ],
  },
  {
    name: "Nova Glide Pro",
    slug: "nova-glide-pro",
    summary: "Mouse inalámbrico de 58 g con sensor de 26.000 DPI.",
    description:
      "Cascarón perforado de 58 gramos, sensor óptico de 26.000 DPI y switches ópticos con 90 millones de pulsaciones garantizadas. Latencia de 1 ms por el receptor de 2,4 GHz.\n\nLa batería dura 90 horas y se carga por USB-C. Incluye pies de PTFE de repuesto.",
    price: 149900,
    sku: "NVA-CMP-004",
    brand: "Nova",
    stock: 63,
    category: "computo",
    views: 1320,
    unitsSold: 118,
    specs: [
      { label: "Peso", value: "58 g" },
      { label: "Sensor", value: "26.000 DPI" },
      { label: "Batería", value: "90 h" },
      { label: "Conexión", value: "2,4 GHz (1 ms) y USB-C" },
    ],
    images: [
      { url: IMAGES.mouse, alt: "Mouse Nova Glide Pro" },
      { url: IMAGES.gear, alt: "Nova Glide Pro junto a otros periféricos" },
    ],
    variants: [
      { group: "color", label: "Color", value: "Negro", hex: "#1A1A1A", stock: 40 },
      { group: "color", label: "Color", value: "Blanco", hex: "#FAFAFA", stock: 23 },
    ],
  },

  // --------------------------------------------------------- Smartphones ---
  {
    name: "Nova Phone X5",
    slug: "nova-phone-x5",
    summary: "Pantalla AMOLED 120 Hz, triple cámara de 50 MP y carga de 67 W.",
    description:
      "El X5 tiene la pantalla AMOLED de 6,7 pulgadas a 120 Hz que esperas de un gama alta, con 1.800 nits de brillo pico para que se lea al sol del mediodía.\n\nSistema de tres cámaras encabezado por un sensor principal de 50 MP con estabilización óptica, ultra gran angular de 12 MP y teleobjetivo 2× . La batería de 5.000 mAh carga al 100 % en 38 minutos con el cargador de 67 W que viene en la caja. Desbloqueado para cualquier operador.",
    price: 1899000,
    compareAtPrice: 2199000,
    sku: "NVA-PHN-001",
    brand: "Nova",
    stock: 21,
    category: "smartphones",
    featured: true,
    bestSeller: true,
    views: 7310,
    unitsSold: 204,
    specs: [
      { label: "Pantalla", value: "6,7\" AMOLED 120 Hz · 1800 nits" },
      { label: "Cámaras", value: "50 MP OIS + 12 MP UGA + 2× tele" },
      { label: "Batería", value: "5000 mAh · 67 W" },
      { label: "Memoria", value: "8 GB RAM" },
      { label: "Red", value: "5G · Dual SIM · desbloqueado" },
      { label: "Garantía", value: "12 meses" },
    ],
    images: [
      { url: IMAGES.phoneFront, alt: "Nova Phone X5 de frente" },
      { url: IMAGES.phoneBack, alt: "Parte trasera del Nova Phone X5" },
      { url: IMAGES.phoneHand, alt: "Nova Phone X5 en la mano" },
    ],
    variants: [
      { group: "almacenamiento", label: "Almacenamiento", value: "256 GB", stock: 14 },
      { group: "almacenamiento", label: "Almacenamiento", value: "512 GB", priceDelta: 320000, stock: 7 },
      { group: "color", label: "Color", value: "Negro titanio", hex: "#1C1C1E", stock: 9 },
      { group: "color", label: "Color", value: "Azul glaciar", hex: "#3B6EA5", stock: 8 },
      { group: "color", label: "Color", value: "Verde salvia", hex: "#8AA58E", stock: 4 },
    ],
  },
  {
    name: "Nova Phone Lite",
    slug: "nova-phone-lite",
    summary: "5G, 128 GB y batería de dos días por menos de un millón.",
    description:
      "Pensado para quien quiere un teléfono que funcione bien y dure, sin pagar por cámaras que no va a usar. Pantalla de 6,5 pulgadas a 90 Hz, 128 GB de almacenamiento ampliables con microSD y batería de 5.000 mAh que llega tranquila al segundo día.\n\nIncluye 5G y jack de 3,5 mm, que cada vez cuesta más encontrar.",
    price: 899000,
    sku: "NVA-PHN-002",
    brand: "Nova",
    stock: 38,
    category: "smartphones",
    views: 3450,
    unitsSold: 156,
    specs: [
      { label: "Pantalla", value: "6,5\" LCD 90 Hz" },
      { label: "Almacenamiento", value: "128 GB + microSD" },
      { label: "Batería", value: "5000 mAh · 33 W" },
      { label: "Extras", value: "Jack 3,5 mm · Dual SIM · 5G" },
    ],
    images: [
      { url: IMAGES.phoneHero, alt: "Nova Phone Lite" },
      { url: IMAGES.phoneBack, alt: "Nova Phone Lite por detrás" },
    ],
    variants: [
      { group: "color", label: "Color", value: "Negro", hex: "#1C1C1E", stock: 20 },
      { group: "color", label: "Color", value: "Lavanda", hex: "#B8A9D9", stock: 18 },
    ],
  },

  // ----------------------------------------------------------- Wearables ---
  {
    name: "Nova Watch Series 4",
    slug: "nova-watch-series-4",
    summary: "Reloj con AMOLED siempre encendido, GPS y 10 días de batería.",
    description:
      "Caja de aluminio de 45 mm con pantalla AMOLED de 1,43\" siempre encendida y cristal templado. Mide frecuencia cardíaca las 24 horas, saturación de oxígeno, sueño por fases y estrés.\n\nGPS de doble banda para correr sin llevar el celular, más de 100 modos deportivos y resistencia 5 ATM. Diez días de batería en uso normal, cuatro si dejas la pantalla siempre encendida.",
    price: 749900,
    compareAtPrice: 899900,
    sku: "NVA-WRB-001",
    brand: "Nova",
    stock: 26,
    category: "wearables",
    bestSeller: true,
    badge: "Más vendido",
    views: 5120,
    unitsSold: 189,
    specs: [
      { label: "Pantalla", value: "1,43\" AMOLED siempre encendida" },
      { label: "Batería", value: "10 días (4 con AOD)" },
      { label: "Sensores", value: "FC, SpO₂, sueño, estrés" },
      { label: "GPS", value: "Doble banda" },
      { label: "Resistencia", value: "5 ATM" },
    ],
    images: [
      { url: IMAGES.watchSmart, alt: "Nova Watch Series 4" },
      { url: IMAGES.watch, alt: "Detalle de la correa del Nova Watch" },
    ],
    variants: [
      { group: "correa", label: "Correa", value: "Silicona negra", hex: "#1A1A1A", stock: 12 },
      { group: "correa", label: "Correa", value: "Silicona arena", hex: "#D6C4A8", stock: 8 },
      { group: "correa", label: "Correa", value: "Milanesa acero", hex: "#A8A8A8", priceDelta: 89000, stock: 6 },
    ],
  },
  {
    name: "Nova Band Fit",
    slug: "nova-band-fit",
    summary: "Banda ligera de 24 g con 14 días de batería y 60 modos deportivos.",
    description:
      "Para quien quiere medir sin cargar un reloj. Pesa 24 gramos, tiene pantalla AMOLED de 1,47\" y llega a 14 días de batería.\n\nMonitoreo continuo de frecuencia cardíaca y sueño, 60 modos deportivos y notificaciones del celular. Resistencia 5 ATM: puedes nadar con ella.",
    price: 189900,
    sku: "NVA-WRB-002",
    brand: "Nova",
    stock: 47,
    category: "wearables",
    isNew: true,
    views: 2240,
    unitsSold: 134,
    specs: [
      { label: "Pantalla", value: "1,47\" AMOLED" },
      { label: "Batería", value: "14 días" },
      { label: "Peso", value: "24 g" },
      { label: "Resistencia", value: "5 ATM" },
    ],
    images: [
      { url: IMAGES.band, alt: "Nova Band Fit" },
      { url: IMAGES.watch, alt: "Nova Band Fit en la muñeca" },
    ],
    variants: [
      { group: "talla", label: "Talla de correa", value: "S/M (14–18 cm)", stock: 25 },
      { group: "talla", label: "Talla de correa", value: "L (18–22 cm)", stock: 22 },
      { group: "color", label: "Color", value: "Negro", hex: "#1A1A1A", stock: 30 },
      { group: "color", label: "Color", value: "Coral", hex: "#E8735A", stock: 17 },
    ],
  },

  // ---------------------------------------------------------- Accesorios ---
  {
    name: "Nova Power 20K",
    slug: "nova-power-20k",
    summary: "Batería externa de 20.000 mAh con 65 W y pantalla de carga.",
    description:
      "Carga un portátil, no solo el celular: 65 W por USB-C alcanzan para un ultrabook. La pantalla muestra el porcentaje exacto, no cuatro lucecitas.\n\nTres salidas simultáneas (2× USB-C, 1× USB-A) y recarga completa en hora y media. Apta para llevar en cabina de avión.",
    price: 139900,
    compareAtPrice: 179900,
    sku: "NVA-ACC-001",
    brand: "Nova",
    stock: 74,
    category: "accesorios",
    views: 1980,
    unitsSold: 221,
    specs: [
      { label: "Capacidad", value: "20.000 mAh (72 Wh)" },
      { label: "Potencia", value: "65 W PD" },
      { label: "Salidas", value: "2× USB-C, 1× USB-A" },
      { label: "Pantalla", value: "Porcentaje digital" },
    ],
    images: [
      { url: IMAGES.powerbank, alt: "Batería externa Nova Power 20K" },
      { url: IMAGES.flatlay, alt: "Nova Power junto a otros accesorios" },
    ],
  },
  {
    name: "Nova GaN 65W",
    slug: "nova-gan-65w",
    summary: "Cargador GaN de tres puertos del tamaño de un adaptador normal.",
    description:
      "Nitruro de galio: mismo poder, la mitad del tamaño. 65 W repartidos entre dos USB-C y un USB-A, suficiente para cargar portátil, celular y audífonos al tiempo.\n\nClavija plegable y protección contra sobrecarga, sobrecalentamiento y cortocircuito.",
    price: 119900,
    sku: "NVA-ACC-002",
    brand: "Nova",
    stock: 88,
    category: "accesorios",
    views: 1430,
    unitsSold: 178,
    specs: [
      { label: "Potencia", value: "65 W total" },
      { label: "Puertos", value: "2× USB-C + 1× USB-A" },
      { label: "Tecnología", value: "GaN II" },
      { label: "Clavija", value: "Plegable" },
    ],
    images: [
      { url: IMAGES.charger, alt: "Cargador Nova GaN de 65 W" },
      { url: IMAGES.gear, alt: "Nova GaN entre otros accesorios" },
    ],
  },
  {
    name: "Nova Hub 8 en 1",
    slug: "nova-hub-8-en-1",
    summary: "Hub USB-C con HDMI 4K, lector SD y carga de 100 W.",
    description:
      "Un solo puerto de tu portátil se convierte en ocho: HDMI 4K a 60 Hz, dos USB-A 3.0, un USB-C de datos, lector SD y microSD, ethernet gigabit y paso de carga de 100 W.\n\nCarcasa de aluminio que disipa el calor y cable trenzado corto para que no quede colgando.",
    price: 189900,
    sku: "NVA-ACC-003",
    brand: "Nova",
    stock: 31,
    category: "accesorios",
    views: 1120,
    unitsSold: 93,
    specs: [
      { label: "Video", value: "HDMI 4K @ 60 Hz" },
      { label: "Datos", value: "2× USB-A 3.0 + 1× USB-C" },
      { label: "Tarjetas", value: "SD y microSD" },
      { label: "Red", value: "Ethernet gigabit" },
      { label: "Carga", value: "Paso de 100 W" },
    ],
    images: [
      { url: IMAGES.hub, alt: "Hub USB-C Nova 8 en 1" },
      { url: IMAGES.desk, alt: "Nova Hub conectado al portátil" },
    ],
  },
  {
    name: "Nova Shield Case",
    slug: "nova-shield-case",
    summary: "Funda con grado militar de caídas y bordes elevados.",
    description:
      "Policarbonato rígido por fuera, TPU blando por dentro y esquinas con cámara de aire: supera la norma MIL-STD-810G de caídas desde 2 metros.\n\nBordes elevados que protegen pantalla y cámaras, y compatibilidad con carga inalámbrica sin quitarla.",
    price: 69900,
    sku: "NVA-ACC-004",
    brand: "Nova",
    stock: 120,
    category: "accesorios",
    views: 860,
    unitsSold: 142,
    specs: [
      { label: "Protección", value: "MIL-STD-810G (2 m)" },
      { label: "Material", value: "Policarbonato + TPU" },
      { label: "Carga", value: "Compatible con Qi" },
    ],
    images: [
      { url: IMAGES.case, alt: "Funda Nova Shield" },
      { url: IMAGES.phoneBack, alt: "Nova Shield puesta en el teléfono" },
    ],
    variants: [
      { group: "modelo", label: "Modelo", value: "Nova Phone X5", stock: 60 },
      { group: "modelo", label: "Modelo", value: "Nova Phone Lite", stock: 60 },
      { group: "color", label: "Color", value: "Transparente", hex: "#E8E8E8", stock: 70 },
      { group: "color", label: "Color", value: "Negro mate", hex: "#222222", stock: 50 },
    ],
  },

  // --------------------------------------------------------- Smart Home ---
  {
    name: "Nova Cam 360",
    slug: "nova-cam-360",
    summary: "Cámara de seguridad 2K con seguimiento automático y visión nocturna.",
    description:
      "Gira 360° en horizontal y 110° en vertical, y sigue sola a quien se mueva en la habitación. Graba en 2K, distingue personas de mascotas y te avisa al celular solo cuando hace falta.\n\nVisión nocturna a color hasta 10 metros, audio de dos vías y almacenamiento local en microSD de hasta 256 GB: no obliga a pagar una nube.",
    price: 229900,
    compareAtPrice: 279900,
    sku: "NVA-SMH-001",
    brand: "Nova",
    stock: 36,
    category: "smart-home",
    isNew: true,
    views: 2680,
    unitsSold: 108,
    specs: [
      { label: "Resolución", value: "2K (2304×1296)" },
      { label: "Rotación", value: "360° horizontal · 110° vertical" },
      { label: "Visión nocturna", value: "A color hasta 10 m" },
      { label: "Almacenamiento", value: "microSD hasta 256 GB" },
      { label: "Detección", value: "Personas y mascotas" },
    ],
    images: [
      { url: IMAGES.camera, alt: "Cámara Nova Cam 360" },
      { url: IMAGES.gear, alt: "Nova Cam 360 instalada" },
    ],
  },
  {
    name: "Nova Bulb Kit ×3",
    slug: "nova-bulb-kit-x3",
    summary: "Tres bombillas RGB con wifi, sin necesidad de hub.",
    description:
      "Se conectan directo al wifi de la casa: no hay que comprar un hub aparte. 16 millones de colores, blanco regulable de 2700 K a 6500 K y rutinas por horario desde la app.\n\nCompatibles con Google Home y Alexa. Rosca E27 estándar, 9 W que rinden como una incandescente de 60 W.",
    price: 129900,
    sku: "NVA-SMH-002",
    brand: "Nova",
    stock: 58,
    category: "smart-home",
    views: 1540,
    unitsSold: 127,
    specs: [
      { label: "Contenido", value: "3 bombillas E27" },
      { label: "Color", value: "16 M de colores · 2700–6500 K" },
      { label: "Potencia", value: "9 W (equiv. 60 W)" },
      { label: "Compatibilidad", value: "Google Home y Alexa" },
      { label: "Conexión", value: "Wifi 2,4 GHz sin hub" },
    ],
    images: [
      { url: IMAGES.bulb, alt: "Kit de bombillas Nova" },
      { url: IMAGES.workspace, alt: "Bombillas Nova instaladas" },
    ],
  },
];

const REVIEWS = [
  {
    product: "nova-pulse-pro",
    authorName: "Camila Restrepo",
    city: "Medellín",
    rating: 5,
    title: "Valen cada peso",
    body: "Los uso ocho horas diarias en la oficina y no me molestan. La cancelación apaga por completo el aire acondicionado. Llegaron al día siguiente y pagué en efectivo al mensajero, sin vueltas.",
    verified: true,
    featured: true,
  },
  {
    product: "nova-phone-x5",
    authorName: "Andrés Gómez",
    city: "Bogotá D.C.",
    rating: 5,
    title: "Mejor de lo que esperaba",
    body: "Venía de un gama media y el salto se nota sobre todo en la cámara de noche. La batería me dura todo el día con uso pesado. Desbloqueado de verdad, le puse mi SIM y listo.",
    verified: true,
    featured: true,
  },
  {
    product: "nova-watch-series-4",
    authorName: "Daniela Ochoa",
    city: "Cali",
    rating: 5,
    title: "La batería es real",
    body: "Prometían 10 días y me está dando 9 con la pantalla encendida un rato. El GPS agarra rápido cuando salgo a correr por el río.",
    verified: true,
    featured: true,
  },
  {
    product: "nova-book-air-14",
    authorName: "Julián Vargas",
    city: "Bucaramanga",
    rating: 4,
    title: "Excelente pantalla, ojalá más puertos",
    body: "La OLED es una maravilla para editar fotos y pesa nada en la mochila. Le pondría un USB-C más, pero con el hub que compré aquí mismo quedó resuelto.",
    verified: true,
    featured: true,
  },
  {
    product: "nova-buds-air",
    authorName: "Sara Jiménez",
    city: "Barranquilla",
    rating: 5,
    title: "No se caen ni corriendo",
    body: "Probé tres marcas antes y estos son los primeros que me quedan firmes. El estuche cabe en el bolsillo del jean.",
    verified: true,
    featured: false,
  },
  {
    product: "nova-power-20k",
    authorName: "Mauricio Peña",
    city: "Pereira",
    rating: 5,
    title: "Carga el portátil de verdad",
    body: "Compré otras que decían 65 W y no movían el computador. Esta sí. La pantallita con el porcentaje exacto es lo mejor.",
    verified: true,
    featured: true,
  },
  {
    product: "nova-k75-mecanico",
    authorName: "Laura Cifuentes",
    city: "Bogotá D.C.",
    rating: 5,
    title: "Con la Ñ donde debe estar",
    body: "Llevaba meses buscando un 75 % en español que no fuera importado. Suena delicioso y cambiar los switches tomó diez minutos.",
    verified: true,
    featured: false,
  },
  {
    product: "nova-cam-360",
    authorName: "Fernando Ruiz",
    city: "Cartagena",
    rating: 4,
    title: "Buena, la app puede mejorar",
    body: "La imagen de noche es nítida y el seguimiento funciona bien con el perro. La app a veces demora en conectar, pero nada grave.",
    verified: true,
    featured: false,
  },
  {
    product: "nova-phone-lite",
    authorName: "Paola Martínez",
    city: "Villavicencio",
    rating: 5,
    title: "Se lo compré a mi mamá",
    body: "Quería algo sencillo y con buena batería. Le dura dos días completos y le encantó que tuviera entrada para audífonos de cable.",
    verified: true,
    featured: false,
  },
  {
    product: "nova-boom",
    authorName: "Santiago Arias",
    city: "Santa Marta",
    rating: 5,
    title: "Se fue a la piscina y sobrevivió",
    body: "Literal cayó al agua en una fiesta, flotó y siguió sonando. Para el tamaño que tiene suena impresionante.",
    verified: true,
    featured: false,
  },
  {
    product: null,
    authorName: "Marcela Duarte",
    city: "Manizales",
    rating: 5,
    title: "Pagar al recibir cambia todo",
    body: "Nunca había comprado tecnología en línea por miedo a que no llegara. Revisé el producto delante del mensajero y ahí pagué. Ya voy por el tercer pedido.",
    verified: true,
    featured: true,
  },
  {
    product: null,
    authorName: "Iván Salazar",
    city: "Ibagué",
    rating: 5,
    title: "Respondieron por WhatsApp en minutos",
    body: "Tenía dudas de compatibilidad antes de pedir y me contestaron de una. El pedido llegó a los dos días a Ibagué.",
    verified: true,
    featured: true,
  },
  {
    product: "nova-glide-pro",
    authorName: "Nicolás Herrera",
    city: "Envigado",
    rating: 4,
    title: "Ligerísimo",
    body: "58 gramos se sienten raro los primeros días y después no quieres volver atrás. Le falta un botón lateral extra para mi gusto.",
    verified: true,
    featured: false,
  },
  {
    product: "nova-gan-65w",
    authorName: "Valentina Lozano",
    city: "Tunja",
    rating: 5,
    title: "Reemplazó tres cargadores",
    body: "Viajo seguido y ahora llevo solo este. Carga el portátil y el celular al tiempo sin ponerse caliente.",
    verified: true,
    featured: false,
  },
];

const BANNERS = [
  {
    eyebrow: "Envío gratis desde $200.000",
    title: "Tecnología que pagas cuando la tienes en la mano",
    subtitle:
      "Audio, cómputo y accesorios originales con garantía de 12 meses. Recibes, revisas y entonces pagas en efectivo.",
    ctaLabel: "Ver catálogo",
    ctaHref: "/productos",
    image: IMAGES.workspace,
    theme: "default",
    active: true,
    position: 0,
  },
  {
    eyebrow: "Black Friday",
    title: "Hasta 40 % en audio y cómputo",
    subtitle: "Tres días. Stock limitado. Sigue siendo pago contra entrega.",
    ctaLabel: "Ver ofertas",
    ctaHref: "/productos?oferta=1",
    image: IMAGES.headphonesStudio,
    theme: "blackfriday",
    active: false,
    position: 1,
  },
  {
    eyebrow: "Navidad",
    title: "Regalos que llegan antes del 24",
    subtitle: "Pide hasta el 20 de diciembre y te llega a tiempo a toda Colombia.",
    ctaLabel: "Ver regalos",
    ctaHref: "/productos",
    image: IMAGES.flatlay,
    theme: "navidad",
    active: false,
    position: 2,
  },
  {
    eyebrow: "Temporada de vacaciones",
    title: "Lleva el sonido a donde vayas",
    subtitle: "Parlantes resistentes al agua y audífonos con batería de sobra.",
    ctaLabel: "Ver audio",
    ctaHref: "/productos?categoria=audio",
    image: IMAGES.speaker,
    theme: "verano",
    active: false,
    position: 3,
  },
];

/** Pedidos de muestra para que el panel tenga historial desde el primer día. */
const ORDERS = [
  { name: "Camila Restrepo", phone: "573012345678", dep: "Antioquia", city: "Medellín", address: "Carrera 43A #18-95, apto 704", notes: "Torre 2, portería recibe", status: "ENTREGADO", daysAgo: 12, items: [["nova-pulse-pro", 1], ["nova-gan-65w", 1]] },
  { name: "Andrés Gómez", phone: "573109876543", dep: "Bogotá D.C.", city: "Bogotá D.C.", address: "Calle 100 #19-54, oficina 302", notes: "Entregar en recepción", status: "ENTREGADO", daysAgo: 9, items: [["nova-phone-x5", 1]] },
  { name: "Daniela Ochoa", phone: "573155551234", dep: "Valle del Cauca", city: "Cali", address: "Avenida 6N #23-41", notes: null, status: "ENTREGADO", daysAgo: 7, items: [["nova-watch-series-4", 1], ["nova-band-fit", 1]] },
  { name: "Julián Vargas", phone: "573204447788", dep: "Santander", city: "Bucaramanga", address: "Calle 36 #31-18", notes: "Casa esquinera, reja verde", status: "ENTREGADO", daysAgo: 5, items: [["nova-book-air-14", 1], ["nova-hub-8-en-1", 1]] },
  { name: "Sara Jiménez", phone: "573003332211", dep: "Atlántico", city: "Barranquilla", address: "Carrera 53 #75-120, apto 501", notes: null, status: "ENVIADO", daysAgo: 2, items: [["nova-buds-air", 2]] },
  { name: "Mauricio Peña", phone: "573178889900", dep: "Risaralda", city: "Pereira", address: "Avenida Circunvalar #12-40", notes: "Llamar antes de llegar", status: "ENVIADO", daysAgo: 2, items: [["nova-power-20k", 1], ["nova-shield-case", 1]] },
  { name: "Laura Cifuentes", phone: "573026665544", dep: "Bogotá D.C.", city: "Bogotá D.C.", address: "Carrera 15 #85-22, apto 903", notes: null, status: "CONFIRMADO", daysAgo: 1, items: [["nova-k75-mecanico", 1], ["nova-glide-pro", 1]] },
  { name: "Fernando Ruiz", phone: "573145556677", dep: "Bolívar", city: "Cartagena", address: "Barrio Manga, Calle 25 #21-30", notes: "Preguntar por Fernando en portería", status: "CONFIRMADO", daysAgo: 1, items: [["nova-cam-360", 2]] },
  { name: "Paola Martínez", phone: "573112223344", dep: "Meta", city: "Villavicencio", address: "Calle 37 #29-15", notes: null, status: "PENDIENTE", daysAgo: 0, items: [["nova-phone-lite", 1], ["nova-shield-case", 1]] },
  { name: "Santiago Arias", phone: "573217778899", dep: "Magdalena", city: "Santa Marta", address: "Carrera 4 #11-25, El Rodadero", notes: "Hotel, dejar en recepción a nombre de Santiago", status: "PENDIENTE", daysAgo: 0, items: [["nova-boom", 1]] },
  { name: "Valentina Lozano", phone: "573059998877", dep: "Boyacá", city: "Tunja", address: "Calle 19 #9-35", notes: null, status: "PENDIENTE", daysAgo: 0, items: [["nova-gan-65w", 2], ["nova-power-20k", 1]] },
  { name: "Nicolás Herrera", phone: "573181112233", dep: "Antioquia", city: "Envigado", address: "Calle 37 Sur #41-20", notes: "Cancelado: encontró mejor precio", status: "CANCELADO", daysAgo: 4, items: [["nova-view-27-4k", 1]] },
] as const;

const SHIPPING_FLAT = 12000;
const FREE_FROM = 200000;

async function main() {
  console.log("→ Limpiando tablas…");
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.productVariant.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.banner.deleteMany();
  await db.setting.deleteMany();
  await db.user.deleteMany();

  // --- Administrador -------------------------------------------------------
  const email = (process.env.ADMIN_EMAIL ?? "admin@novatech.co").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "NovaTech2026!";
  await db.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME ?? "Equipo Nova",
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });
  console.log(`→ Administrador: ${email}`);

  // --- Categorías ----------------------------------------------------------
  const categoryIds = new Map<string, string>();
  for (const [index, category] of CATEGORIES.entries()) {
    const created = await db.category.create({
      data: { ...category, position: index, active: true },
    });
    categoryIds.set(category.slug, created.id);
  }
  console.log(`→ ${CATEGORIES.length} categorías`);

  // --- Productos -----------------------------------------------------------
  const productIds = new Map<string, string>();
  for (const [index, p] of PRODUCTS.entries()) {
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) throw new Error(`Categoría desconocida: ${p.category}`);

    // Escalona las fechas para que "lo más reciente" tenga un orden creíble.
    const createdAt = new Date(Date.now() - (PRODUCTS.length - index) * 36e5 * 18);

    const created = await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        summary: p.summary,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        sku: p.sku,
        brand: p.brand,
        stock: p.stock,
        categoryId,
        active: p.active ?? true,
        featured: p.featured ?? false,
        bestSeller: p.bestSeller ?? false,
        isNew: p.isNew ?? false,
        badge: p.badge ?? null,
        views: p.views,
        unitsSold: p.unitsSold,
        specs: JSON.stringify(p.specs),
        createdAt,
        images: {
          create: p.images.map((image, i) => ({ ...image, position: i })),
        },
        variants: {
          create: (p.variants ?? []).map((v, i) => ({
            group: v.group,
            label: v.label,
            value: v.value,
            hex: v.hex ?? null,
            priceDelta: v.priceDelta ?? 0,
            stock: v.stock,
            position: i,
          })),
        },
      },
    });
    productIds.set(p.slug, created.id);
  }
  console.log(`→ ${PRODUCTS.length} productos`);

  // --- Reseñas -------------------------------------------------------------
  for (const [index, r] of REVIEWS.entries()) {
    await db.review.create({
      data: {
        productId: r.product ? (productIds.get(r.product) ?? null) : null,
        authorName: r.authorName,
        city: r.city,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: r.verified,
        approved: true,
        featured: r.featured,
        createdAt: new Date(Date.now() - (index + 1) * 36e5 * 30),
      },
    });
  }
  console.log(`→ ${REVIEWS.length} reseñas`);

  // --- Banners -------------------------------------------------------------
  for (const b of BANNERS) await db.banner.create({ data: b });
  console.log(`→ ${BANNERS.length} banners`);

  // --- Pedidos -------------------------------------------------------------
  const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
  let sequence = 1;

  for (const o of ORDERS) {
    const createdAt = new Date(Date.now() - o.daysAgo * 864e5 - sequence * 36e5);

    const items = o.items.map(([slug, qty]) => {
      const product = bySlug.get(slug);
      if (!product) throw new Error(`Producto desconocido: ${slug}`);
      return {
        productId: productIds.get(slug) ?? null,
        productName: product.name,
        productSlug: product.slug,
        image: product.images[0]!.url,
        variantLabel: null,
        unitPrice: product.price,
        quantity: qty as number,
        lineTotal: product.price * (qty as number),
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const shipping = subtotal >= FREE_FROM ? 0 : SHIPPING_FLAT;
    const stamp = `${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(
      createdAt.getFullYear()
    ).slice(2)}`;

    await db.order.create({
      data: {
        orderNumber: `NT-${stamp}-${String(sequence).padStart(4, "0")}`,
        status: o.status,
        customerName: o.name,
        customerPhone: o.phone,
        address: o.address,
        city: o.city,
        department: o.dep,
        notes: o.notes,
        subtotal,
        shipping,
        total: subtotal + shipping,
        itemsCount: items.reduce((sum, i) => sum + i.quantity, 0),
        cancelReason: o.status === "CANCELADO" ? "El cliente encontró mejor precio" : null,
        createdAt,
        updatedAt: createdAt,
        confirmedAt: ["CONFIRMADO", "ENVIADO", "ENTREGADO"].includes(o.status)
          ? new Date(createdAt.getTime() + 36e5 * 3)
          : null,
        shippedAt: ["ENVIADO", "ENTREGADO"].includes(o.status)
          ? new Date(createdAt.getTime() + 36e5 * 20)
          : null,
        deliveredAt:
          o.status === "ENTREGADO" ? new Date(createdAt.getTime() + 36e5 * 46) : null,
        items: { create: items },
      },
    });
    sequence += 1;
  }
  console.log(`→ ${ORDERS.length} pedidos`);

  // --- Ajustes -------------------------------------------------------------
  await db.setting.createMany({
    data: [
      { key: "shipping.flatRate", value: String(SHIPPING_FLAT) },
      { key: "shipping.freeFrom", value: String(FREE_FROM) },
      { key: "store.announcement", value: "Pago contra entrega en toda Colombia · Envío gratis desde $200.000" },
    ],
  });

  console.log("\n✔ Seed completado.");
  console.log(`  Panel:      /admin`);
  console.log(`  Usuario:    ${email}`);
  console.log(`  Contraseña: ${password}\n`);
}

main()
  .catch((error) => {
    console.error("\n✘ Falló el seed:\n", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
