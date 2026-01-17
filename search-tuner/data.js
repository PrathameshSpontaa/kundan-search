// ========================================
// Sample Location Data
// Simulating 10,000 locations with various types
// ========================================

const LOCATION_TYPES = {
    cafe: { icon: '☕', color: '#f59e0b' },
    restaurant: { icon: '🍽️', color: '#ef4444' },
    bar: { icon: '🍺', color: '#8b5cf6' },
    gym: { icon: '💪', color: '#10b981' },
    park: { icon: '🌳', color: '#22c55e' },
    pool: { icon: '🏊', color: '#3b82f6' },
    sports: { icon: '⚽', color: '#f97316' },
    wellness: { icon: '🧘', color: '#ec4899' },
    entertainment: { icon: '🎮', color: '#6366f1' },
    shopping: { icon: '🛍️', color: '#14b8a6' },
    event: { icon: '🎉', color: '#f43f5e' },
    japanese: { icon: '🇯🇵', color: '#dc2626' },
    dessert: { icon: '🍰', color: '#f472b6' },
    tea: { icon: '🍵', color: '#84cc16' }
};

// Sample locations - in production this would come from your database
const SAMPLE_LOCATIONS = [
    // Mocha-related locations
    {
        id: 1,
        name: "Mocha Cafe",
        category: "cafe",
        tags: ["coffee", "mocha", "espresso", "wifi"],
        description: "Cozy cafe serving artisan mocha drinks and pastries",
        reviews: [
            "Best mocha latte in town!",
            "Love their white mocha",
            "Great atmosphere for working"
        ],
        rating: 4.8,
        location: "Downtown"
    },
    {
        id: 2,
        name: "The Mocha House",
        category: "cafe",
        tags: ["coffee", "mocha", "breakfast"],
        description: "Family-owned coffee house specializing in mocha beverages",
        reviews: [
            "Their signature mocha is amazing",
            "Friendly staff, great mocha"
        ],
        rating: 4.5,
        location: "Midtown"
    },
    {
        id: 3,
        name: "Mochi Paradise",
        category: "dessert",
        tags: ["mochi", "japanese", "dessert", "ice cream"],
        description: "Authentic Japanese mochi and desserts",
        reviews: [
            "Best mochi ice cream ever!",
            "Love the matcha mochi",
            "Traditional Japanese flavors"
        ],
        rating: 4.9,
        location: "Little Tokyo"
    },
    {
        id: 4,
        name: "Matcha Mochi Tea House",
        category: "tea",
        tags: ["matcha", "mochi", "japanese", "tea"],
        description: "Traditional Japanese tea house with mochi desserts",
        reviews: [
            "Authentic matcha ceremony",
            "Their mochi is fresh daily"
        ],
        rating: 4.7,
        location: "Arts District"
    },
    {
        id: 5,
        name: "Downtown Coffee Co",
        category: "cafe",
        tags: ["coffee", "espresso", "local"],
        description: "Local roastery with great mocha options",
        reviews: [
            "Try their iced mocha!",
            "Good coffee, nice vibe",
            "The mocha frappuccino is perfect for summer"
        ],
        rating: 4.3,
        location: "Downtown"
    },
    
    // Sushi-related
    {
        id: 10,
        name: "Sushi Master",
        category: "japanese",
        tags: ["sushi", "japanese", "seafood", "omakase"],
        description: "Premium omakase sushi experience",
        reviews: [
            "Best sushi in the city",
            "Fresh fish, amazing chef"
        ],
        rating: 4.9,
        location: "Downtown"
    },
    {
        id: 11,
        name: "Sushi Roll Express",
        category: "japanese",
        tags: ["sushi", "quick", "affordable"],
        description: "Fast casual sushi with creative rolls",
        reviews: [
            "Great for quick sushi fix",
            "Affordable and tasty"
        ],
        rating: 4.2,
        location: "Westside"
    },
    {
        id: 12,
        name: "Tokyo Garden",
        category: "japanese",
        tags: ["japanese", "ramen", "sushi", "izakaya"],
        description: "Full Japanese menu including sushi and ramen",
        reviews: [
            "Their sushi combo is great value",
            "Love the ramen here"
        ],
        rating: 4.4,
        location: "Eastside"
    },
    
    // Pool/Sports
    {
        id: 20,
        name: "Aqua Pool Club",
        category: "pool",
        tags: ["swimming", "pool", "fitness", "leisure"],
        description: "Olympic-sized pool with lap swimming and lessons",
        reviews: [
            "Clean pool, great facilities",
            "Best pool in the area"
        ],
        rating: 4.6,
        location: "Sports Complex"
    },
    {
        id: 21,
        name: "Poolside Lounge",
        category: "bar",
        tags: ["pool", "bar", "billiards", "nightlife"],
        description: "Upscale pool hall and cocktail bar",
        reviews: [
            "Great pool tables",
            "Fun atmosphere, strong drinks"
        ],
        rating: 4.4,
        location: "Downtown"
    },
    {
        id: 22,
        name: "Community Pool Center",
        category: "pool",
        tags: ["swimming", "pool", "family", "lessons"],
        description: "Family-friendly community swimming pool",
        reviews: [
            "Great for kids",
            "Affordable swimming lessons"
        ],
        rating: 4.1,
        location: "Suburb"
    },
    
    // Pickleball/Sports
    {
        id: 30,
        name: "Pickleball Palace",
        category: "sports",
        tags: ["pickleball", "tennis", "sports", "recreation"],
        description: "Dedicated pickleball courts with lessons",
        reviews: [
            "Best pickleball facility around",
            "Great courts, friendly community"
        ],
        rating: 4.8,
        location: "Recreation Park"
    },
    {
        id: 31,
        name: "Sports & Racquet Club",
        category: "sports",
        tags: ["tennis", "pickleball", "squash", "fitness"],
        description: "Multi-sport facility with pickleball courts",
        reviews: [
            "Nice pickleball courts",
            "Good for all racquet sports"
        ],
        rating: 4.5,
        location: "Northside"
    },
    
    // Coffee shops
    {
        id: 40,
        name: "Starbucks Reserve",
        category: "cafe",
        tags: ["coffee", "starbucks", "premium", "wifi"],
        description: "Premium Starbucks experience with rare coffees",
        reviews: [
            "Love their reserve roasts",
            "Great mocha here too"
        ],
        rating: 4.3,
        location: "Downtown"
    },
    {
        id: 41,
        name: "Starbucks - Main Street",
        category: "cafe",
        tags: ["coffee", "starbucks", "quick"],
        description: "Your neighborhood Starbucks",
        reviews: [
            "Consistent coffee",
            "Fast service"
        ],
        rating: 4.0,
        location: "Main Street"
    },
    
    // Yoga/Wellness
    {
        id: 50,
        name: "Yoga Flow Studio",
        category: "wellness",
        tags: ["yoga", "meditation", "wellness", "fitness"],
        description: "Hot yoga and meditation classes",
        reviews: [
            "Transformative yoga experience",
            "Great instructors"
        ],
        rating: 4.9,
        location: "Wellness District"
    },
    {
        id: 51,
        name: "Zen Yoga & Spa",
        category: "wellness",
        tags: ["yoga", "spa", "massage", "relaxation"],
        description: "Yoga studio with spa services",
        reviews: [
            "Perfect for self-care",
            "Love the yoga classes"
        ],
        rating: 4.7,
        location: "Uptown"
    },
    
    // Events
    {
        id: 60,
        name: "Summer Music Festival",
        category: "event",
        tags: ["music", "festival", "outdoor", "concert"],
        description: "Annual outdoor music festival",
        reviews: [
            "Best festival of the year!",
            "Amazing lineup"
        ],
        rating: 4.8,
        location: "Central Park"
    },
    {
        id: 61,
        name: "Food & Wine Expo",
        category: "event",
        tags: ["food", "wine", "tasting", "expo"],
        description: "Annual food and wine tasting event",
        reviews: [
            "So many great vendors",
            "Must-attend for foodies"
        ],
        rating: 4.6,
        location: "Convention Center"
    },
    
    // More variety
    {
        id: 70,
        name: "Sunset Surfing Beach",
        category: "sports",
        tags: ["surfing", "beach", "lessons", "rentals"],
        description: "Premier surfing spot with rentals and lessons",
        reviews: [
            "Great waves for beginners",
            "Beautiful sunset views"
        ],
        rating: 4.7,
        location: "Beachfront"
    },
    {
        id: 71,
        name: "Rock Climbing Gym",
        category: "gym",
        tags: ["climbing", "bouldering", "fitness"],
        description: "Indoor rock climbing facility",
        reviews: [
            "Challenging routes",
            "Great for all levels"
        ],
        rating: 4.5,
        location: "Industrial District"
    },
    {
        id: 72,
        name: "Retro Arcade Bar",
        category: "entertainment",
        tags: ["arcade", "bar", "games", "retro"],
        description: "Classic arcade games with craft cocktails",
        reviews: [
            "Nostalgia overload!",
            "Fun games, great drinks"
        ],
        rating: 4.6,
        location: "Arts District"
    },
    {
        id: 73,
        name: "The Green Market",
        category: "shopping",
        tags: ["farmers market", "organic", "local", "produce"],
        description: "Weekly farmers market with local vendors",
        reviews: [
            "Fresh produce every week",
            "Support local farmers!"
        ],
        rating: 4.8,
        location: "Town Square"
    },
    {
        id: 74,
        name: "Starlight Cinema",
        category: "entertainment",
        tags: ["movies", "cinema", "outdoor", "events"],
        description: "Outdoor movie screenings under the stars",
        reviews: [
            "Magical movie experience",
            "Bring blankets!"
        ],
        rating: 4.7,
        location: "Riverside Park"
    },
    {
        id: 75,
        name: "Brew & Beans",
        category: "cafe",
        tags: ["coffee", "craft beer", "hybrid"],
        description: "Coffee by day, craft beer by night",
        reviews: [
            "Great concept!",
            "Love their cold brew and IPAs"
        ],
        rating: 4.4,
        location: "Midtown"
    }
];

// Generate more locations to simulate larger dataset
function generateMoreLocations(baseLocations, targetCount) {
    const locations = [...baseLocations];
    const prefixes = ['The', 'New', 'Old', 'Classic', 'Modern', 'Urban', 'Cozy', 'Premier', 'Elite', 'Local'];
    const suffixes = ['Place', 'Spot', 'Hub', 'Center', 'Corner', 'House', 'Room', 'Studio', 'Club', 'Lounge'];
    
    let id = 100;
    const categories = Object.keys(LOCATION_TYPES);
    
    while (locations.length < targetCount) {
        const baseIdx = Math.floor(Math.random() * baseLocations.length);
        const base = baseLocations[baseIdx];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        locations.push({
            id: id++,
            name: `${prefix} ${base.name.split(' ')[0]} ${suffix}`,
            category: categories[Math.floor(Math.random() * categories.length)],
            tags: [...base.tags.slice(0, 2), 'generated'],
            description: `A great ${base.category} experience`,
            reviews: base.reviews.slice(0, 1),
            rating: (3.5 + Math.random() * 1.5).toFixed(1),
            location: ['Downtown', 'Uptown', 'Midtown', 'Westside', 'Eastside'][Math.floor(Math.random() * 5)]
        });
    }
    
    return locations;
}

// Export locations (we'll keep it smaller for demo, but structure supports 10k+)
const LOCATIONS = generateMoreLocations(SAMPLE_LOCATIONS, 200);

// Make available globally
window.LOCATIONS = LOCATIONS;
window.LOCATION_TYPES = LOCATION_TYPES;
