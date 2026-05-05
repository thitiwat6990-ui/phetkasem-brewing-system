export type InventoryItem = {
  id: string;
  name: string;
  category: 'Malt' | 'Hops' | 'Yeast' | 'Packaging' | 'Other';
  quantity: number;
  unit: string;
  company?: string;
  status: 'In Stock' | 'Low' | 'Out of Stock';
};

export type RecipeIngredient = {
  itemId: string;
  quantity: number;
};

export type RecipeMalt = {
  name: string;
  weight: number; // kg
  percentage: number;
  colorEBC: number;
};

export type RecipeHop = {
  name: string;
  weight: number; // grams
  alphaAcid: number; // %
  use: string; // e.g. "Boil", "Dry Hop"
  time: number; // minutes
  ibu: number;
};

export type RecipeMashStep = {
  stepName: string;
  temperature: number; // Celsius
  time: number; // minutes
};

export type RecipeVitals = {
  originalGravity: number;
  finalGravity: number;
  colorEBC: number;
  buGuRatio: number;
};

export type RecipeProcess = {
  equipment: string;
  efficiency: number; // %
  batchVolume: number; // L
  boilTime: number; // min
  mashWater: number; // L
  spargeWater: number; // L
  preBoilGravity?: number;
};

export type Recipe = {
  id: string;
  name: string;
  style: string;
  targetAbv: number;
  ibu: number;
  ingredients: RecipeIngredient[]; // used for simple inventory deduction
  
  // Detailed Recipe Information
  author?: string;
  vitals?: RecipeVitals;
  process?: RecipeProcess;
  mashSteps?: RecipeMashStep[];
  malts?: RecipeMalt[];
  hops?: RecipeHop[];
};

export type BatchStage = 'Preparation' | 'Mashing' | 'Boiling' | 'Fermentation' | 'Conditioning' | 'Packaged';

export type Batch = {
  id: string;
  recipeId: string;
  batchNumber: string;
  stage: BatchStage;
  startDate: string;
  temperature?: number; // in Celsius
  specificGravity?: number;
  notes?: string;
};

export type TankStatus = 'Empty' | 'Brewing' | 'ColdCrash';

export type Tank = {
  id: string;
  zoneId: number;
  name: string;
  capacity: number; // in Liters
  status: TankStatus;
  currentRecipeId?: string;
  currentBatchId?: string;
  startDate?: string;
  currentOg?: number;
};

export type KegReservationStatus = 'Pending Payment' | 'Paid' | 'Pending Delivery' | 'Delivered';

export type KegReservation = {
  id: string;
  customerName: string;
  shopName: string;
  quantity: number;
  dateReserved: string;
  status: KegReservationStatus;
};

export type KegBatch = {
  id: string;
  batchId: string;
  recipeId: string;
  batchNumber: string;
  totalKegs: number;
  availableKegs: number;
  litersPerKeg: number;
  pricePerKeg: number;
  shippingCost: number;
  datePackaged: string;
  reservations: KegReservation[];
};

export type LogEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
};

export const MOCK_SUPPLIERS: string[] = [
  'Weyermann',
  'Briess',
  'Yakima Chief',
  'Fermentis',
  'Ball Corporation',
  'Crown Holdings',
  'Other'
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Pale Ale Malt', category: 'Malt', quantity: 1250, unit: 'kg', company: 'Weyermann', status: 'In Stock' },
  { id: 'inv-2', name: 'Pilsner Malt', category: 'Malt', quantity: 800, unit: 'kg', company: 'Weyermann', status: 'In Stock' },
  { id: 'inv-3', name: 'Crystal Malt 60L', category: 'Malt', quantity: 45, unit: 'kg', company: 'Briess', status: 'Low' },
  { id: 'inv-4', name: 'Cascade Hops', category: 'Hops', quantity: 15, unit: 'kg', company: 'Yakima Chief', status: 'In Stock' },
  { id: 'inv-5', name: 'Citra Hops', category: 'Hops', quantity: 2, unit: 'kg', company: 'Yakima Chief', status: 'Low' },
  { id: 'inv-6', name: 'Mosaic Hops', category: 'Hops', quantity: 0, unit: 'kg', company: 'Yakima Chief', status: 'Out of Stock' },
  { id: 'inv-7', name: 'US-05 Ale Yeast', category: 'Yeast', quantity: 20, unit: 'pkgs', company: 'Fermentis', status: 'In Stock' },
  { id: 'inv-8', name: 'W34/70 Lager Yeast', category: 'Yeast', quantity: 5, unit: 'pkgs', company: 'Fermentis', status: 'Low' },
  { id: 'inv-9', name: '12oz Cans', category: 'Packaging', quantity: 15000, unit: 'cans', company: 'Ball Corporation', status: 'In Stock' },
  { id: 'inv-10', name: 'Crown Caps', category: 'Packaging', quantity: 2000, unit: 'caps', company: 'Crown Holdings', status: 'Low' },
];

export const MOCK_RECIPES: Recipe[] = [
  { 
    id: 'rec-1', name: 'Lock lord 120L 2026 v.2', style: 'International Pale Lager', targetAbv: 5.0, ibu: 21,
    ingredients: [{ itemId: 'inv-2', quantity: 18 }, { itemId: 'inv-4', quantity: 0.5 }, { itemId: 'inv-8', quantity: 2 }],
    author: 'Ref. David Heath',
    vitals: { originalGravity: 1.046, finalGravity: 1.008, colorEBC: 7.1, buGuRatio: 0.46 },
    process: { equipment: 'BrewZilla / RoboBrew 65L', efficiency: 80, batchVolume: 120, boilTime: 30, mashWater: 40.47, spargeWater: 107.2, preBoilGravity: 1.044 },
    mashSteps: [
      { stepName: 'Temperature', temperature: 65, time: 30 },
      { stepName: 'Temperature', temperature: 68, time: 30 },
      { stepName: 'Mash Out', temperature: 75, time: 10 }
    ],
    malts: [
      { name: 'Weyermann Pilsner', weight: 18, percentage: 83, colorEBC: 3.3 },
      { name: 'Weyermann Carapils/Carafoam', weight: 1.2, percentage: 5.5, colorEBC: 3.9 },
      { name: 'Weyermann Vienna Malt', weight: 1.0, percentage: 4.6, colorEBC: 5.9 },
      { name: 'ข้าวคั่ว', weight: 1.0, percentage: 4.6, colorEBC: 3.9 },
      { name: 'Weyermann Melanoidin', weight: 0.48, percentage: 2.2, colorEBC: 59 }
    ],
    hops: [
      { name: 'Saaz', weight: 171.2, alphaAcid: 4.0, use: 'Boil', time: 30, ibu: 12 },
      { name: 'German Tradition', weight: 57.9, alphaAcid: 4.3, use: 'Boil', time: 30, ibu: 4 },
      { name: 'German Tradition', weight: 133.3, alphaAcid: 4.3, use: 'Boil', time: 5, ibu: 3 },
      { name: 'Saaz', weight: 133.3, alphaAcid: 4.5, use: 'Boil', time: 5, ibu: 3 },
      { name: 'Saaz', weight: 93.3, alphaAcid: 4.0, use: 'Boil', time: 0, ibu: 0 }
    ]
  },
  { 
    id: 'rec-2', name: 'Midnight Stout', style: 'Oatmeal Stout', targetAbv: 5.8, ibu: 30,
    ingredients: [{ itemId: 'inv-1', quantity: 10 }, { itemId: 'inv-3', quantity: 2 }, { itemId: 'inv-4', quantity: 0.3 }, { itemId: 'inv-7', quantity: 1 }]
  },
  { 
    id: 'rec-3', name: 'Crisp Pilsner', style: 'German Pilsner', targetAbv: 4.8, ibu: 35,
    ingredients: [{ itemId: 'inv-2', quantity: 11 }, { itemId: 'inv-4', quantity: 0.4 }, { itemId: 'inv-8', quantity: 1 }]
  },
  { 
    id: 'rec-4', name: 'Hazy Horizon', style: 'NEIPA', targetAbv: 7.2, ibu: 40,
    ingredients: [{ itemId: 'inv-1', quantity: 14 }, { itemId: 'inv-5', quantity: 0.8 }, { itemId: 'inv-7', quantity: 1 }]
  },
  { 
    id: 'rec-5', name: 'Sunset Amber', style: 'Amber Ale', targetAbv: 5.5, ibu: 25,
    ingredients: [{ itemId: 'inv-1', quantity: 8 }, { itemId: 'inv-3', quantity: 1.5 }, { itemId: 'inv-4', quantity: 0.2 }, { itemId: 'inv-7', quantity: 1 }]
  },
];

export const MOCK_BATCHES: Batch[] = [
  { id: 'batch-001', recipeId: 'rec-1', batchNumber: 'B-001', stage: 'Conditioning', startDate: '2026-04-15', temperature: 2.5, specificGravity: 1.012 },
  { id: 'batch-002', recipeId: 'rec-3', batchNumber: 'B-002', stage: 'Fermentation', startDate: '2026-04-28', temperature: 12.0, specificGravity: 1.035, notes: 'Active fermentation observed' },
  { id: 'batch-003', recipeId: 'rec-4', batchNumber: 'B-003', stage: 'Fermentation', startDate: '2026-05-01', temperature: 19.5, specificGravity: 1.050 },
  { id: 'batch-004', recipeId: 'rec-2', batchNumber: 'B-004', stage: 'Boiling', startDate: '2026-05-04', temperature: 100.0 },
  { id: 'batch-005', recipeId: 'rec-5', batchNumber: 'B-005', stage: 'Preparation', startDate: '2026-05-05' },
  { id: 'batch-006', recipeId: 'rec-1', batchNumber: 'B-006', stage: 'Packaged', startDate: '2026-03-20' },
];

export const MOCK_KEG_BATCHES: KegBatch[] = [
  {
    id: 'keg-b-001',
    batchId: 'batch-006',
    recipeId: 'rec-1',
    batchNumber: 'B-006',
    totalKegs: 4,
    availableKegs: 2,
    litersPerKeg: 30,
    pricePerKeg: 2500,
    shippingCost: 200,
    datePackaged: '2026-05-01',
    reservations: [
      { id: 'res-1', customerName: 'John Doe', shopName: 'Craft Beer Bar', quantity: 2, dateReserved: '2026-05-02', status: 'Pending Delivery' }
    ]
  }
];

export const MOCK_METRICS = {
  activeBatches: MOCK_BATCHES.filter(b => b.stage !== 'Packaged').length,
  lowInventoryCount: MOCK_INVENTORY.filter(i => i.status === 'Low').length,
  productionVolume: '1,250 BBL',
};

// Generate 4 zones with 3 fermentors each (60L capacity)
export const MOCK_TANKS: Tank[] = Array.from({ length: 12 }, (_, i) => {
  const zoneId = Math.floor(i / 3) + 1;
  const tankNum = (i % 3) + 1;
  return {
    id: `tank-${i + 1}`,
    zoneId,
    name: `T-${zoneId}0${tankNum}`,
    capacity: 60, // 60 Liters capacity as requested
    status: 'Empty',
  };
});
