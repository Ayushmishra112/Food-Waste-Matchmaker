// Mock NGO data for FeedForward AI matchmaking
export const ngoData = [
  {
    id: 1,
    name: "Annapoorna Foundation",
    distance: 1.2,
    distanceLabel: "1.2 km away",
    capacity: 95,
    currentNeed: "High",
    refrigeration: true,
    rating: 4.9,
    totalDonations: 1842,
    tags: ["Fast Pickup", "Verified NGO", "Hot Food OK"],
    tagColors: {
      "Fast Pickup": "orange",
      "Verified NGO": "blue",
      "Hot Food OK": "green",
    },
    description: "Serving underprivileged communities in South Delhi with daily hot meals since 2010.",
    phone: "+91 98765 43210",
    operatingHours: "6 AM – 10 PM",
    preferredFoodTypes: ["cooked", "raw"],
    coordinates: { x: 38, y: 35 },
  },
  {
    id: 2,
    name: "Sewa Sadan Trust",
    distance: 2.7,
    distanceLabel: "2.7 km away",
    capacity: 78,
    currentNeed: "Medium",
    refrigeration: true,
    rating: 4.7,
    totalDonations: 1124,
    tags: ["Verified NGO", "Cold Storage", "Large Capacity"],
    tagColors: {
      "Verified NGO": "blue",
      "Cold Storage": "indigo",
      "Large Capacity": "purple",
    },
    description: "Operating a network of community kitchens across West Delhi, focusing on nutritious meals for children.",
    phone: "+91 98765 00123",
    operatingHours: "7 AM – 9 PM",
    preferredFoodTypes: ["cooked", "raw"],
    coordinates: { x: 62, y: 55 },
  },
  {
    id: 3,
    name: "Roti Bank Delhi",
    distance: 3.5,
    distanceLabel: "3.5 km away",
    capacity: 60,
    currentNeed: "Low",
    refrigeration: false,
    rating: 4.5,
    totalDonations: 887,
    tags: ["Accepts Raw Food", "Weekend Active"],
    tagColors: {
      "Accepts Raw Food": "green",
      "Weekend Active": "orange",
    },
    description: "Collecting and redistributing surplus food from restaurants and households to those in need.",
    phone: "+91 91234 56789",
    operatingHours: "9 AM – 8 PM",
    preferredFoodTypes: ["raw"],
    coordinates: { x: 75, y: 70 },
  },
  {
    id: 4,
    name: "Hope Kitchen NGO",
    distance: 4.1,
    distanceLabel: "4.1 km away",
    capacity: 88,
    currentNeed: "High",
    refrigeration: true,
    rating: 4.8,
    totalDonations: 2341,
    tags: ["Non-Veg Accepted", "Verified NGO", "Fast Pickup"],
    tagColors: {
      "Non-Veg Accepted": "orange",
      "Verified NGO": "blue",
      "Fast Pickup": "green",
    },
    description: "Premier food rescue organization serving migrant workers and daily wage earners across North Delhi.",
    phone: "+91 95555 12345",
    operatingHours: "24 Hours",
    preferredFoodTypes: ["cooked", "raw"],
    coordinates: { x: 55, y: 20 },
  },
];

// Compute match scores based on form data
export function computeMatches(formData, ngos) {
  return ngos
    .map((ngo) => {
      let score = 50;
      // Proximity score (closer = higher)
      score += Math.max(0, 25 - ngo.distance * 5);
      // Capacity
      score += (ngo.capacity / 100) * 15;
      // Refrigeration match for cooked food
      if (formData.foodState === "cooked" && ngo.refrigeration) score += 10;
      // Need urgency
      if (ngo.currentNeed === "High") score += 10;
      else if (ngo.currentNeed === "Medium") score += 5;
      // Food type compatibility
      if (ngo.preferredFoodTypes.includes(formData.foodState)) score += 5;

      return { ...ngo, matchScore: Math.min(Math.round(score), 99) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
