import { colors } from '../theme/colors';

export const sponsors = {
  RAD: {
    name: 'RAD',
    logo: require('../../assets/images/merch/RAD/logo.png'),
    description: 'Premium athletic footwear designed for performance and style.',
  },
  GOWOD: {
    name: 'GOWOD',
    logo: require('../../assets/images/merch/gowod/gowod-logo_1200x1200.webp'),
    description: 'Professional mobility and flexibility training.',
  },
  CHILLY_GOAT: {
    name: 'Chilly GOAT',
    logo: require('../../assets/images/merch/chilly goat/Chilly_GOAT_by_MS_color_SM_e00ef0e0-a677-47bc-9413-a63271c7f98e.webp'),
    description: 'Recovery and wellness solutions for athletes.',
  },
  GYMREAPERS: {
    name: 'Gymreapers',
    logo: require('../../assets/images/merch/gymreapers/logo_gymreapers.png'),
    description: 'High-quality lifting gear and apparel.',
  },
};

export const products = [
  // RAD Products
  {
    id: 'rad-1',
    name: 'RAD ONE V2 Triple Black',
    price: 129.99,
    category: 'footwear',
    sponsor: 'RAD',
    description: 'Premium athletic shoe with triple black colorway. Perfect for training and everyday wear.',
    images: [
      require('../../assets/images/merch/RAD/r-a-d-r-one-v2-triple-black-footwear-897.webp'),
    ],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    inStock: true,
    featured: true,
  },
  {
    id: 'rad-2',
    name: 'RAD ONE V2 Dust Purple',
    price: 129.99,
    category: 'footwear',
    sponsor: 'RAD',
    description: 'Stylish dust purple colorway of the RAD ONE V2. Designed for comfort and performance.',
    images: [
      require('../../assets/images/merch/RAD/r-a-d-r-one-v2-dust-purple-footwear-521.webp'),
    ],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    inStock: true,
    featured: false,
  },
  {
    id: 'rad-3',
    name: 'RAD ONE V2 Flower Blush',
    price: 129.99,
    category: 'footwear',
    sponsor: 'RAD',
    description: 'Limited edition Flower Blush colorway for the RAD ONE V2.',
    images: [
      require('../../assets/images/merch/RAD/r-a-d-r-one-v2-flower-blush-footwear-939.webp'),
    ],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    inStock: true,
    featured: false,
  },
  // GOWOD Products
  {
    id: 'gowod-1',
    name: 'GOWOD Mobility Kit',
    price: 79.99,
    category: 'equipment',
    sponsor: 'GOWOD',
    description: 'Complete mobility training kit including bands, foam roller, and access to the GOWOD app.',
    images: [
      require('../../assets/images/merch/gowod/justin_mobilizing.webp'),
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'gowod-2',
    name: 'GOWOD Pigeon Stretch Poster',
    price: 19.99,
    category: 'accessories',
    sponsor: 'GOWOD',
    description: 'Poster of Justin Medeiros demonstrating the pigeon stretch.',
    images: [
      require('../../assets/images/merch/gowod/justin-pigeon-2-p_2x.jpeg'),
    ],
    inStock: true,
    featured: false,
  },
  // Chilly GOAT Products
  {
    id: 'chilly-1',
    name: 'Chilly GOAT Recovery Tub',
    price: 299.99,
    category: 'recovery',
    sponsor: 'CHILLY_GOAT',
    description: 'Professional-grade recovery tub for optimal muscle recovery and relaxation.',
    images: [
      require('../../assets/images/merch/chilly goat/tubs/1-2023-CG-Valaris-Glacier-mockup-1.webp'),
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'chilly-2',
    name: 'Chilly GOAT Sauna MP2',
    price: 1499.99,
    category: 'recovery',
    sponsor: 'CHILLY_GOAT',
    description: 'Portable sauna for at-home recovery and relaxation.',
    images: [
      require('../../assets/images/merch/chilly goat/saunas/MP2-1.webp'),
    ],
    inStock: true,
    featured: false,
  },
  // Gymreapers Belts
  {
    id: 'gymreapers-1',
    name: '10mm Lever Belt - Black',
    price: 89.99,
    category: 'equipment',
    sponsor: 'GYMREAPERS',
    description: 'Premium 10mm leather lever belt for maximum support during heavy lifts.',
    images: [
      require('../../assets/images/merch/gymreapers/belts/10mm-lever-belt-black-back.webp'),
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
  },
  {
    id: 'gymreapers-2',
    name: '10mm Lever Belt - Red',
    price: 89.99,
    category: 'equipment',
    sponsor: 'GYMREAPERS',
    description: 'Premium 10mm leather lever belt in red. Perfect for making a statement in the gym.',
    images: [
      require('../../assets/images/merch/gymreapers/belts/10mm-lever-belt-red-back.jpg'),
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    featured: false,
  },
  // Gymreapers Apparel
  {
    id: 'gymreapers-3',
    name: 'Iron Tee - Black/White',
    price: 29.99,
    category: 'apparel',
    sponsor: 'GYMREAPERS',
    description: 'Classic Iron Tee in black and white.',
    images: [
      require('../../assets/images/merch/gymreapers/men\'s apparel/iron-tee-black-white-front.webp'),
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    featured: false,
  },
  {
    id: 'gymreapers-4',
    name: 'Infinity Leggings - Atlantis',
    price: 49.99,
    category: 'apparel',
    sponsor: 'GYMREAPERS',
    description: 'Women\'s Infinity Leggings in Atlantis color.',
    images: [
      require('../../assets/images/merch/gymreapers/women\'s apparel/infinity-leggings-atlantis-front-full.webp'),
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    featured: false,
  },
  // Gymreapers Accessories
  {
    id: 'gymreapers-5',
    name: 'Wrist Wraps - Black',
    price: 19.99,
    category: 'accessories',
    sponsor: 'GYMREAPERS',
    description: 'Durable wrist wraps for extra support during lifts.',
    images: [
      require('../../assets/images/merch/gymreapers/lifting gear & accessories/wrist-wraps-black-single.jpg'),
    ],
    inStock: true,
    featured: false,
  },
  // Placeholder for Justin's Merch
  {
    id: 'jm-1',
    name: 'JM Training Tee',
    price: 29.99,
    category: 'apparel',
    sponsor: false,
    description: 'Premium cotton training tee with Justin\'s signature logo.',
    images: [
      require('../../assets/images/merch/gowod/Justin-Medeiros-stretching-after-a-crossfit-workout-routine.webp'),
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    featured: true,
  },
];

export const categories = [
  { key: 'all', label: 'All', icon: 'storefront-outline' },
  { key: 'footwear', label: 'Footwear', icon: 'shoe-sneaker' },
  { key: 'apparel', label: 'Apparel', icon: 'tshirt-crew' },
  { key: 'equipment', label: 'Equipment', icon: 'dumbbell' },
  { key: 'recovery', label: 'Recovery', icon: 'snowflake' },
  { key: 'accessories', label: 'Accessories', icon: 'watch-variant' },
];

export const getProductsByCategory = (category) => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};

export const getProductsBySponsor = (sponsor) => {
  return products.filter(product => product.sponsor === sponsor);
};

export const getFeaturedProducts = () => {
  return products.filter(product => product.featured);
};

export const getProductById = (id) => {
  return products.find(product => product.id === id);
}; 