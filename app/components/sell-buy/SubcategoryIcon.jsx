'use client';

import React from 'react';
import {
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Laptop,
  Tv,
  Refrigerator,
  Camera,
  Car,
  Bike,
  Sofa,
  Bed,
  Lamp,
  Shirt,
  ShoppingBag,
  Gem,
  BookOpen,
  Music,
  Dumbbell,
  Briefcase,
  Wrench,
  Sparkles,
  Tag,
  Grid,
  Cpu,
  Package,
  Home,
  Layers,
} from 'lucide-react';

const ICON_MAP = {
  smartphone: Smartphone,
  phone: Smartphone,
  mobile: Smartphone,
  smartphones: Smartphone,
  tablet: Tablet,
  tablets: Tablet,
  ipad: Tablet,
  watch: Watch,
  watches: Watch,
  smartwatch: Watch,
  wearable: Watch,
  headphones: Headphones,
  accessories: Headphones,
  cable: Headphones,
  laptop: Laptop,
  laptops: Laptop,
  computer: Laptop,
  computers: Laptop,
  tv: Tv,
  tvs: Tv,
  television: Tv,
  audio: Tv,
  video: Tv,
  refrigerator: Refrigerator,
  fridge: Refrigerator,
  appliances: Refrigerator,
  washing: Refrigerator,
  camera: Camera,
  cameras: Camera,
  lens: Camera,
  car: Car,
  cars: Car,
  vehicle: Car,
  vehicles: Car,
  bike: Bike,
  bikes: Bike,
  motorcycle: Bike,
  scooter: Bike,
  sofa: Sofa,
  sofas: Sofa,
  furniture: Sofa,
  bed: Bed,
  beds: Bed,
  wardrobe: Bed,
  mattress: Bed,
  lamp: Lamp,
  decor: Lamp,
  lighting: Lamp,
  shirt: Shirt,
  clothing: Shirt,
  mens: Shirt,
  womens: ShoppingBag,
  dress: ShoppingBag,
  fashion: ShoppingBag,
  jewelry: Gem,
  gem: Gem,
  bag: ShoppingBag,
  bags: ShoppingBag,
  book: BookOpen,
  books: BookOpen,
  magazine: BookOpen,
  magazines: BookOpen,
  music: Music,
  instrument: Music,
  instruments: Music,
  sports: Dumbbell,
  fitness: Dumbbell,
  gym: Dumbbell,
  job: Briefcase,
  jobs: Briefcase,
  freelance: Briefcase,
  service: Wrench,
  services: Wrench,
  repair: Wrench,
  tag: Tag,
  grid: Grid,
  package: Package,
  home: Home,
  sparkles: Sparkles,
  cpu: Cpu,
  layers: Layers,
};

export function getSubcategoryIconComponent(iconName, subName = '') {
  const cleanIcon = (iconName || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (cleanIcon && ICON_MAP[cleanIcon]) {
    return ICON_MAP[cleanIcon];
  }

  // Look up by keywords in the subcategory name or icon name
  const text = `${cleanIcon} ${(subName || '').toLowerCase()}`;
  for (const [key, IconComp] of Object.entries(ICON_MAP)) {
    if (text.includes(key)) {
      return IconComp;
    }
  }

  return Tag;
}

export function SubcategoryIcon({ icon, name, className = 'w-4 h-4' }) {
  const IconComp = getSubcategoryIconComponent(icon, name);
  return <IconComp className={className} />;
}

export default SubcategoryIcon;
