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

export const MOCK_INVENTORY: InventoryItem[] = [];

export const MOCK_RECIPES: Recipe[] = [];

export const MOCK_BATCHES: Batch[] = [];

export const MOCK_KEG_BATCHES: KegBatch[] = [];

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
