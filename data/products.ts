import { Product } from "@/types";

const lightsImg = require("../assets/images/cat_lights.jpg");
const stereoImg = require("../assets/images/cat_stereo.jpg");
const seatsImg = require("../assets/images/cat_seats.jpg");
const bannerImg = require("../assets/images/banner1.jpg");

const products: Product[] = [
  {
    id: "p1",
    name: "OSRAM LED Headlight Bulb H4 (Pair)",
    categoryId: "lights",
    price: 2499,
    mrp: 3999,
    image: lightsImg,
    images: [lightsImg],
    description:
      "Upgrade your vehicle's lighting with OSRAM LED H4 bulbs. 6000K white light, 200% brighter than halogen. Easy plug-and-play installation. IP68 waterproof rating.",
    specs: [
      { label: "Wattage", value: "25W per bulb" },
      { label: "Color Temp", value: "6000K (White)" },
      { label: "Lumens", value: "6000 LM" },
      { label: "Voltage", value: "12V DC" },
      { label: "Warranty", value: "1 Year" },
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 328,
    isFeatured: true,
    isBestseller: true,
  },
  {
    id: "p2",
    name: "RGB LED Interior Light Strip (4pcs)",
    categoryId: "lights",
    price: 799,
    mrp: 1499,
    image: lightsImg,
    images: [lightsImg],
    description:
      "16 million colors RGB LED strip light for car interior. App-controlled via Bluetooth. Music sync mode. Waterproof design.",
    specs: [
      { label: "Control", value: "Bluetooth App" },
      { label: "Colors", value: "16 Million RGB" },
      { label: "Length", value: "4 x 1.5 Meter" },
      { label: "Voltage", value: "12V DC" },
    ],
    inStock: true,
    rating: 4.3,
    reviewCount: 215,
    isNew: true,
  },
  {
    id: "p3",
    name: "Android 10 Car Stereo 9-inch (Universal)",
    categoryId: "stereo",
    price: 7999,
    mrp: 12999,
    image: stereoImg,
    images: [stereoImg],
    description:
      "9-inch Full HD IPS touchscreen Android car stereo with GPS navigation, Bluetooth 5.0, WiFi, USB, FM radio. 2GB RAM + 32GB ROM. Apple CarPlay & Android Auto compatible.",
    specs: [
      { label: "Screen", value: '9" IPS HD' },
      { label: "RAM/ROM", value: "2GB / 32GB" },
      { label: "OS", value: "Android 10" },
      { label: "Bluetooth", value: "5.0" },
      { label: "GPS", value: "Built-in" },
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 512,
    isFeatured: true,
    isBestseller: true,
  },
  {
    id: "p4",
    name: "Android 12 Car Stereo 10-inch (Creta/Seltos)",
    categoryId: "stereo",
    price: 10999,
    mrp: 16999,
    image: stereoImg,
    images: [stereoImg],
    description:
      "10-inch QLED Android 12 stereo custom-fit for Creta, Seltos, and similar models. 4GB RAM + 64GB ROM, 360-degree camera support, DSP amplifier.",
    specs: [
      { label: "Screen", value: '10" QLED' },
      { label: "RAM/ROM", value: "4GB / 64GB" },
      { label: "OS", value: "Android 12" },
      { label: "Camera", value: "360 Surround Support" },
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 189,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "p5",
    name: "Premium Leatherite Seat Cover Set (5-Seater)",
    categoryId: "seats",
    price: 3499,
    mrp: 5999,
    image: seatsImg,
    images: [seatsImg],
    description:
      "Full set premium leatherite seat covers with contrast stitching. Waterproof, scratch-resistant, airbag compatible. Custom-fit for most 5-seater cars.",
    specs: [
      { label: "Material", value: "Leatherite" },
      { label: "Fitment", value: "5-Seater Universal" },
      { label: "Airbag", value: "Compatible" },
      { label: "Warranty", value: "2 Years" },
    ],
    inStock: true,
    rating: 4.4,
    reviewCount: 673,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: "p6",
    name: "3D Honeycomb Floor Mat Set (7pcs)",
    categoryId: "mats",
    price: 1199,
    mrp: 2499,
    image: bannerImg,
    images: [bannerImg],
    description:
      "Heavy duty 3D honeycomb design floor mats. Anti-slip, waterproof, odor-free material. Complete set of 7 pieces for full car coverage.",
    specs: [
      { label: "Material", value: "TPE Rubber" },
      { label: "Pieces", value: "7 (Full Set)" },
      { label: "Design", value: "Honeycomb 3D" },
      { label: "Fitment", value: "Universal Cut-to-Fit" },
    ],
    inStock: true,
    rating: 4.2,
    reviewCount: 421,
    isBestseller: true,
  },
  {
    id: "p7",
    name: "HD Reversing Camera 170° Wide Angle",
    categoryId: "cameras",
    price: 1999,
    mrp: 3499,
    image: bannerImg,
    images: [bannerImg],
    description:
      "HD 1080P rear view camera with 170° wide angle, night vision, waterproof IP68. Connects to any monitor or Android stereo.",
    specs: [
      { label: "Resolution", value: "1080P HD" },
      { label: "Angle", value: "170° Wide" },
      { label: "Night Vision", value: "Yes (IR)" },
      { label: "Waterproof", value: "IP68" },
    ],
    inStock: true,
    rating: 4.3,
    reviewCount: 298,
    isNew: true,
  },
  {
    id: "p8",
    name: "Parking Sensor Kit (4 Sensors)",
    categoryId: "cameras",
    price: 2199,
    mrp: 3999,
    image: bannerImg,
    images: [bannerImg],
    description:
      "Ultrasonic parking sensor kit with LED display and buzzer alert. 4 sensors with automatic detection. Easy DIY installation.",
    specs: [
      { label: "Sensors", value: "4 Ultrasonic" },
      { label: "Display", value: "LED + Buzzer" },
      { label: "Range", value: "0.3m - 2.5m" },
      { label: "Waterproof", value: "IP67" },
    ],
    inStock: true,
    rating: 4.1,
    reviewCount: 156,
  },
  {
    id: "p9",
    name: "Musical Air Horn 12V (Loud 120dB)",
    categoryId: "horns",
    price: 649,
    mrp: 999,
    image: bannerImg,
    images: [bannerImg],
    description:
      "Powerful 120dB musical air horn with compressor. 12V DC compatible, chrome finish, multiple tone options. Easy bolt-on installation.",
    specs: [
      { label: "Sound Level", value: "120 dB" },
      { label: "Voltage", value: "12V DC" },
      { label: "Tones", value: "Multiple Musical" },
      { label: "Finish", value: "Chrome" },
    ],
    inStock: true,
    rating: 4.0,
    reviewCount: 387,
    isBestseller: true,
  },
  {
    id: "p10",
    name: "Car Dashboard Camera DVR (1080P)",
    categoryId: "cameras",
    price: 3299,
    mrp: 5999,
    image: bannerImg,
    images: [bannerImg],
    description:
      "Full HD 1080P dash cam with 3-inch IPS screen, night vision, loop recording, G-sensor, and parking mode. Wide 170° angle lens.",
    specs: [
      { label: "Resolution", value: "1080P Full HD" },
      { label: "Screen", value: '3" IPS' },
      { label: "Night Vision", value: "Yes" },
      { label: "G-Sensor", value: "Built-in" },
    ],
    inStock: true,
    rating: 4.4,
    reviewCount: 203,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "p11",
    name: "Premium Car Steering Wheel Cover (Leather)",
    categoryId: "interior",
    price: 549,
    mrp: 999,
    image: seatsImg,
    images: [seatsImg],
    description:
      "Genuine microfiber leather steering cover with anti-slip grip. Diameter 37-38cm. Breathable and sweat-resistant material.",
    specs: [
      { label: "Material", value: "Microfiber Leather" },
      { label: "Diameter", value: "37-38 cm" },
      { label: "Color", value: "Black with Red Stitch" },
    ],
    inStock: true,
    rating: 4.2,
    reviewCount: 445,
  },
  {
    id: "p12",
    name: "Car Fragrance Diffuser Premium (Set of 3)",
    categoryId: "interior",
    price: 399,
    mrp: 699,
    image: bannerImg,
    images: [bannerImg],
    description:
      "Luxury car perfume diffuser with long-lasting fragrance. Set of 3 different scents — Ocean, Woody, and Fresh. Vent clip design.",
    specs: [
      { label: "Scents", value: "Ocean, Woody, Fresh" },
      { label: "Duration", value: "60 Days Each" },
      { label: "Type", value: "Vent Clip" },
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 621,
    isBestseller: true,
  },
  {
    id: "p13",
    name: "Universal Car Phone Holder (Dashboard)",
    categoryId: "interior",
    price: 349,
    mrp: 599,
    image: bannerImg,
    images: [bannerImg],
    description:
      "360° rotating gravity car phone holder. Universal fit for phones 4.7 - 6.8 inches. Strong suction cup mount for dashboard or windshield.",
    specs: [
      { label: "Rotation", value: "360°" },
      { label: "Phone Size", value: '4.7" - 6.8"' },
      { label: "Mount", value: "Suction / CD Slot" },
    ],
    inStock: true,
    rating: 4.3,
    reviewCount: 892,
    isBestseller: true,
  },
  {
    id: "p14",
    name: "Front & Rear Bumper Protector Strip",
    categoryId: "exterior",
    price: 599,
    mrp: 1199,
    image: bannerImg,
    images: [bannerImg],
    description:
      "Rubber bumper protector strip with 3M adhesive tape. Prevents scratches and dents. Universal fitment. Anti-collision, weatherproof.",
    specs: [
      { label: "Material", value: "Rubber + Chrome" },
      { label: "Length", value: "1.5 Meter" },
      { label: "Adhesive", value: "3M Grade" },
    ],
    inStock: true,
    rating: 4.0,
    reviewCount: 234,
    isNew: true,
  },
  {
    id: "p15",
    name: "Bosch Wiper Blade Set (Pair)",
    categoryId: "spare",
    price: 849,
    mrp: 1499,
    image: bannerImg,
    images: [bannerImg],
    description:
      "Bosch Aerotwin flat wiper blades. Frameless design for superior contact. Spot-free wiping performance in rain. Available in sizes 20\"/24\".",
    specs: [
      { label: "Brand", value: "Bosch Aerotwin" },
      { label: "Type", value: "Flat / Frameless" },
      { label: "Size", value: '20" + 24"' },
      { label: "Fitment", value: "Universal Adapter" },
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 317,
    isBestseller: true,
  },
];

export default products;

export const getFeaturedProducts = () => products.filter((p) => p.isFeatured);
export const getNewProducts = () => products.filter((p) => p.isNew);
export const getBestsellerProducts = () => products.filter((p) => p.isBestseller);
export const getProductsByCategory = (categoryId: string) =>
  products.filter((p) => p.categoryId === categoryId);
export const getProductById = (id: string) => products.find((p) => p.id === id);
export const searchProducts = (query: string) => {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryId.toLowerCase().includes(q)
  );
};
