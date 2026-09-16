// EcoPulse Initial Seed Data & Storage Models

export const INITIAL_CATEGORIES = [
  { id: 'illegal_dumping', label: 'Illegal Waste Dumping', icon: 'trash-2', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'water_pollution', label: 'Water Contamination', icon: 'droplets', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  { id: 'air_pollution', label: 'Air & Emissions Hazard', icon: 'wind', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
  { id: 'deforestation', label: 'Deforestation & Green Loss', icon: 'tree-pine', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'chemical_spill', label: 'Hazardous Chemical / Industrial', icon: 'alert-triangle', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { id: 'wildlife_threat', label: 'Wildlife & Biodiversity Threat', icon: 'paw-print', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' }
];

export const INITIAL_REPORTS = [
  {
    id: 'REP-101',
    title: 'Toxic Slag & Heavy Plastic Runoff near Willow Creek',
    category: 'water_pollution',
    urgency: 'Critical',
    status: 'In Progress', // Reported, In Progress, Resolved
    locationName: 'Willow Creek Greenway, North Bank',
    lat: 37.7749,
    lng: -122.4194,
    description: 'Significant industrial effluent creating opaque blue foam and chemical odors drifting into the salmon spawning habitat. Multiple dead fish spotted downstream.',
    reportedBy: 'Elena Rostova',
    reporterBadge: 'Eco Guardian',
    timestamp: '2 hours ago',
    date: '2026-09-16T08:30:00Z',
    upvotes: 42,
    hasUpvoted: false,
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    resolvedImage: null,
    officialResponse: 'Municipal Water Protection Agency dispatched rapid hazmat containment unit. Booms deployed at culvert 4B.',
    dispatchedUnit: 'Rapid Water Hazmat Unit 3',
    aiAssessment: {
      riskLevel: 'Critical (94/100)',
      pollutantType: 'Suspected surfactant / chemical runoff',
      recommendedAction: 'Immediate containment boom deployment & water toxicity assay'
    }
  },
  {
    id: 'REP-102',
    title: 'Commercial E-Waste & Battery Abandonment in Oakridge Park',
    category: 'illegal_dumping',
    urgency: 'Critical',
    status: 'Reported',
    locationName: 'Oakridge Park, South Trailhead',
    lat: 37.7650,
    lng: -122.4450,
    description: 'Over 30 discarded industrial lead-acid batteries and stripped circuit boards dumped under pine grove. Rain is expected tonight which may leach lead into groundwater.',
    reportedBy: 'Marcus Chen',
    reporterBadge: 'Green Ranger',
    timestamp: '5 hours ago',
    date: '2026-09-16T05:15:00Z',
    upvotes: 28,
    hasUpvoted: false,
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    resolvedImage: null,
    officialResponse: null,
    dispatchedUnit: null,
    aiAssessment: {
      riskLevel: 'Critical (89/100)',
      pollutantType: 'Heavy metals, Lead, Sulfuric Acid',
      recommendedAction: 'Priority hazardous material pickup before rainfall'
    }
  },
  {
    id: 'REP-103',
    title: 'Unauthorized Old-Growth Tree Cutting behind Industrial Zone',
    category: 'deforestation',
    urgency: 'Moderate',
    status: 'Reported',
    locationName: 'Bayshore Industrial Perimeter',
    lat: 37.7520,
    lng: -122.3980,
    description: 'Contractors bulldozing heritage eucalyptus and live oak trees outside designated zoning lines. No municipal permit displayed on site.',
    reportedBy: 'Sarah Lin',
    reporterBadge: 'Civic Watchdog',
    timestamp: '1 day ago',
    date: '2026-09-15T10:00:00Z',
    upvotes: 19,
    hasUpvoted: false,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    resolvedImage: null,
    officialResponse: 'Urban Forestry Commission issued temporary cease-and-desist pending boundary survey.',
    dispatchedUnit: 'District 4 Forestry Inspector',
    aiAssessment: {
      riskLevel: 'Moderate (65/100)',
      pollutantType: 'Canopy loss & soil erosion',
      recommendedAction: 'Enforce zoning stop-work order and calculate replacement tree restitution'
    }
  },
  {
    id: 'REP-104',
    title: 'Dense Diesel Soot & Chemical Fumes from Unfiltered Vent',
    category: 'air_pollution',
    urgency: 'Moderate',
    status: 'In Progress',
    locationName: 'Harbor Logistics District, Pier 18',
    lat: 37.7880,
    lng: -122.3890,
    description: 'Black plume exhaust emitting constantly between 11 PM and 6 AM. Noticeable sulfurous smell affecting adjacent residential neighborhood.',
    reportedBy: 'Kavita Patel',
    reporterBadge: 'Eco Sprout',
    timestamp: '2 days ago',
    date: '2026-09-14T14:40:00Z',
    upvotes: 35,
    hasUpvoted: true,
    image: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&w=800&q=80',
    resolvedImage: null,
    officialResponse: 'Air Quality Management District installed portable particulate monitor at fence line.',
    dispatchedUnit: 'Air Compliance Inspection Division',
    aiAssessment: {
      riskLevel: 'Moderate (71/100)',
      pollutantType: 'PM2.5, Nitrogen Oxides, Volatile Organic Compounds',
      recommendedAction: 'Enforce continuous stack emission monitoring'
    }
  },
  {
    id: 'REP-105',
    title: 'Cleared Plastic Pollution & Riverbank Cleaned at Marina Wharf',
    category: 'water_pollution',
    urgency: 'Low',
    status: 'Resolved',
    locationName: 'Marina Harbor Lagoon',
    lat: 37.8050,
    lng: -122.4350,
    description: 'Over 400 lbs of floating single-use plastics and packaging trapped in marina drainage corner remediated with volunteer barrier.',
    reportedBy: 'David Romero',
    reporterBadge: 'Earth Guardian',
    timestamp: '3 days ago',
    date: '2026-09-13T09:20:00Z',
    upvotes: 67,
    hasUpvoted: true,
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80',
    resolvedImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    officialResponse: 'Remediation completed by Harbor District team in coordination with Community Blue Cleaners. Netting filter installed.',
    dispatchedUnit: 'Marina Environmental Works Crew',
    aiAssessment: {
      riskLevel: 'Resolved (0/100)',
      pollutantType: 'Microplastics & marine debris',
      recommendedAction: 'Site verified clean; quarterly trash trap maintenance scheduled'
    }
  },
  {
    id: 'REP-106',
    title: 'Corroded Barrel Leakage in Abandoned Rail Yard',
    category: 'chemical_spill',
    urgency: 'Critical',
    status: 'In Progress',
    locationName: 'Potrero South Railyards, Track 9',
    lat: 37.7550,
    lng: -122.3900,
    description: 'Three 55-gallon rusted drums tipped over with viscous yellow residue seeping toward storm drain. Strong solvent vapor smell.',
    reportedBy: 'Amara Vance',
    reporterBadge: 'Green Ranger',
    timestamp: '1 day ago',
    date: '2026-09-15T16:10:00Z',
    upvotes: 53,
    hasUpvoted: false,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    resolvedImage: null,
    officialResponse: 'Environmental Health Hazmat team on scene with absorption pillows and overpack recovery drums.',
    dispatchedUnit: 'Hazmat Response Unit 1',
    aiAssessment: {
      riskLevel: 'Critical (98/100)',
      pollutantType: 'Corrosive industrial solvent',
      recommendedAction: 'Immediate 100-meter evacuation perimeter & neutralizer application'
    }
  },
  {
    id: 'REP-107',
    title: 'Migratory Bird Nesting Disturbance at Coastal Wetland',
    category: 'wildlife_threat',
    urgency: 'Moderate',
    status: 'Resolved',
    locationName: 'Presidio Marsh Sanctuary',
    lat: 37.8010,
    lng: -122.4680,
    description: 'Unleashed dogs repeatedly flushing endangered Snowy Plover pairs during peak egg nesting season in fenced preservation zones.',
    reportedBy: 'Dr. Jesse Wong',
    reporterBadge: 'Bio-Sentinel',
    timestamp: '4 days ago',
    date: '2026-09-12T11:30:00Z',
    upvotes: 41,
    hasUpvoted: false,
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    resolvedImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    officialResponse: 'Park Rangers reinforced protective fencing and increased active patrols. 3 educational signs placed.',
    dispatchedUnit: 'National Park Wildlife Stewardship Patrol',
    aiAssessment: {
      riskLevel: 'Resolved (10/100)',
      pollutantType: 'Habitat disturbance',
      recommendedAction: 'Physical barrier reinforcement & active canine leash enforcement'
    }
  }
];

export const INITIAL_INITIATIVES = [
  {
    id: 'INIT-201',
    title: 'The Great Urban Canopy Blitz: 2,500 Native Trees',
    category: 'Tree Planting & Reforestation',
    description: 'Revitalizing heat-island corridors across Eastern Districts by planting climate-resilient oak, maple, and flowering dogwood saplings with smart moisture sensors.',
    organizer: 'Green City Coalition & Urban Forestry Dept.',
    location: 'District 7 Greenways & School Corridors',
    date: 'Saturday, Oct 3, 2026 • 09:00 AM',
    target: 2500,
    current: 1840,
    unit: 'Trees Planted',
    volunteers: 312,
    pointsReward: 50,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    hasJoined: true,
    tags: ['Urban Canopy', 'Cooling Island', 'Family Friendly']
  },
  {
    id: 'INIT-202',
    title: 'Watershed & Coastal Plastic Interceptor Drive',
    category: 'Clean Water & Ocean Defense',
    description: 'Mobilizing community cleanup squads with kayak sweeps and magnetic rakes to prevent microplastics from flowing past the Estuary floodgates.',
    organizer: 'Clean Waters Alliance & Baykeepers',
    location: 'Estuary Marina & South Pier',
    date: 'Sunday, Oct 11, 2026 • 08:30 AM',
    target: 6000,
    current: 4420,
    unit: 'kg Trash Diverted',
    volunteers: 188,
    pointsReward: 40,
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    hasJoined: false,
    tags: ['Water Protection', 'Kayak Sweep', 'High Impact']
  },
  {
    id: 'INIT-203',
    title: 'Community Rooftop Solar Co-op & Microgrid Pilot',
    category: 'Clean Energy & Decarbonization',
    description: 'Pooling neighborhood solar purchasing power to equip 150 low-income households with rooftop photovoltaic arrays and smart backup battery storage.',
    organizer: 'Citizen Power Network',
    location: 'Mission Valley Neighborhood Center',
    date: 'Saturday, Oct 17, 2026 • 10:00 AM',
    target: 150,
    current: 98,
    unit: 'Homes Solarized',
    volunteers: 74,
    pointsReward: 60,
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    hasJoined: false,
    tags: ['Solar Power', 'Clean Energy', 'Justice 40']
  },
  {
    id: 'INIT-204',
    title: 'Neighborhood E-Waste & Rare Metal Recycling Sprint',
    category: 'Circular Economy & Zero Waste',
    description: 'Drop off obsolete laptops, cellphones, lithium batteries, and cables for safe certified extraction, preventing mercury and cadmium soil contamination.',
    organizer: 'Zero Waste Vanguard & TechRecycle',
    location: 'Civic Plaza Central Hub',
    date: 'Saturday, Oct 24, 2026 • 09:00 AM',
    target: 5000,
    current: 3180,
    unit: 'kg E-Waste Recycled',
    volunteers: 95,
    pointsReward: 35,
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    hasJoined: false,
    tags: ['E-Waste', 'Toxic Prevention', 'Free Dropoff']
  },
  {
    id: 'INIT-205',
    title: 'Native Pollinator Highway & Pocket Meadow Creation',
    category: 'Biodiversity & Wildlife',
    description: 'Transforming 4 miles of barren median strips into drought-tolerant milkweed and wildflower sanctuaries for monarch butterflies and native bees.',
    organizer: 'Wild Pollinators Guild',
    location: 'Boulevard Median Corridors',
    date: 'Sunday, Nov 1, 2026 • 09:30 AM',
    target: 4000,
    current: 2850,
    unit: 'sq. meters Restored',
    volunteers: 142,
    pointsReward: 45,
    image: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    hasJoined: false,
    tags: ['Pollinators', 'Biodiversity', 'Native Flora']
  }
];

export const INITIAL_USER = {
  name: 'Chaitanya Anand',
  handle: '@chaitanya_eco',
  role: 'citizen', // 'citizen' or 'municipal'
  rankTitle: 'Earth Guardian',
  tier: 3,
  ecoPoints: 485,
  nextTierPoints: 600,
  reportsCount: 8,
  initiativesJoined: 4,
  cleanupsAttended: 6,
  co2OffsetKg: 340,
  wasteDivertedKg: 195,
  badges: [
    { id: 'first_responder', name: 'First Responder', icon: 'zap', desc: 'Reported an urgent hazard within 1 hour of occurrence', unlocked: true },
    { id: 'canopy_defender', name: 'Canopy Defender', icon: 'trees', desc: 'Planted over 50 native trees across municipal drives', unlocked: true },
    { id: 'water_sentinel', name: 'Clean Water Sentinel', icon: 'droplets', desc: 'Identified and stopped industrial creek contamination', unlocked: true },
    { id: 'zero_waste_hero', name: 'Zero-Waste Titan', icon: 'recycle', desc: 'Participated in 3+ neighborhood circular recycling drives', unlocked: true },
    { id: 'master_mobilizer', name: 'Community Mobilizer', icon: 'users', desc: 'Gathered 20+ citizens to support an environmental initiative', unlocked: false },
    { id: 'solar_advocate', name: 'Solar Pioneer', icon: 'sun', desc: 'Enrolled rooftop in community clean microgrid co-op', unlocked: false }
  ]
};

export const INITIAL_LEADERBOARD = [
  { rank: 1, name: 'Maya Sterling', district: 'Mission Greens', points: 1240, reports: 22, initiatives: 14, badge: 'Eco Vanguard' },
  { rank: 2, name: 'Chaitanya Anand', district: 'Presidio Heights', points: 485, reports: 8, initiatives: 4, badge: 'Earth Guardian', isCurrentUser: true },
  { rank: 3, name: 'David Romero', district: 'Marina Harbor', points: 460, reports: 9, initiatives: 5, badge: 'Earth Guardian' },
  { rank: 4, name: 'Elena Rostova', district: 'Willow Creek', points: 415, reports: 6, initiatives: 3, badge: 'Green Ranger' },
  { rank: 5, name: 'Kavita Patel', district: 'South Bay', points: 380, reports: 5, initiatives: 4, badge: 'Green Ranger' },
  { rank: 6, name: 'Marcus Chen', district: 'Oakridge Hills', points: 345, reports: 4, initiatives: 2, badge: 'Green Ranger' },
  { rank: 7, name: 'Sarah Lin', district: 'Sunset Dunes', points: 290, reports: 3, initiatives: 3, badge: 'Eco Sprout' }
];

export const DISTRICT_IMPACT = [
  { district: 'Mission Greens', score: 96, trees: 820, wasteKg: 2450, resolvedPct: 92 },
  { district: 'Presidio Heights', score: 91, trees: 650, wasteKg: 1890, resolvedPct: 88 },
  { district: 'Marina Harbor', score: 87, trees: 430, wasteKg: 2150, resolvedPct: 85 },
  { district: 'Oakridge Hills', score: 79, trees: 510, wasteKg: 1420, resolvedPct: 78 },
  { district: 'Willow Creek', score: 74, trees: 340, wasteKg: 1100, resolvedPct: 72 }
];
