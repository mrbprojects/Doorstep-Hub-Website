export const cities = [
  { name: "Hyderabad", centers: 18, area: "Ameerpet, Kukatpally, Gachibowli", icon: "/Hyderabad.png" },
  { name: "Bangalore", centers: 22, area: "Whitefield, Indiranagar, JP Nagar", icon: "/Banglore.png" },
  { name: "Chennai", centers: 14, area: "T. Nagar, Velachery, Anna Nagar", icon: "/chennai.png" },
  { name: "Vijayawada", centers: 8, area: "Benz Circle, Governorpet, Auto Nagar", icon: "/Vijayawada.png" },
  { name: "Pune", centers: 16, area: "Hinjewadi, Wakad, Kothrud", icon: "/pune.png" },
  { name: "Mumbai", centers: 26, area: "Andheri, Thane, Navi Mumbai", icon: "/Mumbai.png" },
];

export const categories = [
  { name: "Computer Repair", icon: "💻", slug: "computer" },
  { name: "LED TV Repair", icon: "📺", slug: "tv" },
  { name: "Refrigerator Repair", icon: "❄️", slug: "refrigerator" },
  { name: "Washing Machine Repair", icon: "🧺", slug: "washing-machine" },
  { name: "Microwave Oven Repair", icon: "♨️", slug: "microwave" },
  { name: "Geyser Repair", icon: "🔥", slug: "geyser" },
];

export const brandMap = {
  computer: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer"],
  tv: ["Samsung", "LG", "Sony", "Mi", "OnePlus", "TCL"],
  refrigerator: ["LG", "Samsung", "Whirlpool", "Godrej", "Haier", "Bosch"],
  "washing-machine": ["LG", "Samsung", "IFB", "Whirlpool", "Bosch", "Haier"],
  microwave: ["IFB", "LG", "Samsung", "Panasonic", "Bajaj", "Bosch"],
  geyser: ["AO Smith", "Racold", "Havells", "Bajaj", "V-Guard", "Crompton"],
};

export const actionTypes = ["Repair", "Service", "Installation"];

export function serviceName(category, brand) {
  const appliance = category.name.replace(" Repair", "");
  if (category.slug === "computer") return `${brand} Laptop Repair`;
  return `${brand} ${appliance} Repair`;
}
