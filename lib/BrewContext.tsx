"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tank, InventoryItem, Recipe, LogEntry, Batch, KegBatch, KegReservation, MOCK_TANKS, MOCK_INVENTORY, MOCK_RECIPES, MOCK_SUPPLIERS, MOCK_BATCHES, MOCK_KEG_BATCHES } from './mockData';
import { getInitialState, saveRecipe, removeRecipe, saveInventoryItem, removeInventoryItem, saveTank, saveBatch, removeBatch, saveKegBatch, saveLog } from '@/actions/data';
import { sendLineNotification } from '@/actions/line';

type BrewContextType = {
  tanks: Tank[];
  inventory: InventoryItem[];
  suppliers: string[];
  recipes: Recipe[];
  logs: LogEntry[];
  batches: Batch[];
  kegBatches: KegBatch[];

  startBrew: (tankId: string, recipeId: string) => { success: boolean; message: string };
  cancelBrew: (tankId: string) => { success: boolean; message: string };
  updateTankOg: (tankId: string, og: number) => void;
  updateTankPh: (tankId: string, ph: number) => void;
  toggleDryHop: (tankId: string, completed: boolean) => void;
  coldCrashTank: (tankId: string) => { success: boolean; message: string };
  packageKegs: (tankId: string, totalKegs: number, litersPerKeg: number, pricePerKeg: number, shippingCost: number, fg: number) => { success: boolean; message: string };
  addKegReservation: (kegBatchId: string, customerName: string, shopName: string, quantity: number) => { success: boolean; message: string };

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  addSupplier: (name: string) => void;
  deleteSupplier: (name: string) => void;

  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  addLog: (action: string, details: string) => void;
};

const BrewContext = createContext<BrewContextType | undefined>(undefined);

export function BrewProvider({ children }: { children: React.ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>(MOCK_TANKS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [suppliers, setSuppliers] = useState<string[]>(MOCK_SUPPLIERS);
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [batches, setBatches] = useState<Batch[]>(MOCK_BATCHES);
  const [kegBatches, setKegBatches] = useState<KegBatch[]>(MOCK_KEG_BATCHES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const result = await getInitialState();
      if (result.success && result.data) {
        
        // Merge Tanks (Hardware should always exist)
        if (result.data.tanks.length > 0) {
          setTanks(MOCK_TANKS.map(mt => result.data.tanks.find(dt => dt.id === mt.id) || mt));
        }

        // Merge Inventory (Keep mock data as baseline, override with DB updates, add new DB items)
        if (result.data.inventory.length > 0) {
          const mergedInv = MOCK_INVENTORY.map(mi => result.data.inventory.find(di => di.id === mi.id) || mi);
          const newInv = result.data.inventory.filter(di => !MOCK_INVENTORY.some(mi => mi.id === di.id));
          setInventory([...mergedInv, ...newInv]);
        }

        // Merge Recipes
        if (result.data.recipes.length > 0) {
          const mergedRec = MOCK_RECIPES.map(mr => result.data.recipes.find(dr => dr.id === mr.id) || mr);
          const newRec = result.data.recipes.filter(dr => !MOCK_RECIPES.some(mr => mr.id === dr.id));
          setRecipes([...mergedRec, ...newRec]);
        }

        if (result.data.batches.length > 0) setBatches(result.data.batches);
        if (result.data.kegBatches.length > 0) setKegBatches(result.data.kegBatches);
        if (result.data.logs && result.data.logs.length > 0) setLogs(result.data.logs);
      }
      setIsLoaded(true);
    }
    loadData();
  }, []);

  const addLog = (action: string, details: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Brewer', // Defaulting to Brewer for now
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
    saveLog(newLog); // Persist to database
  };

  const startBrew = (tankId: string, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Recipe not found.' };

    const tank = tanks.find(t => t.id === tankId);
    if (!tank || tank.status !== 'Empty') return { success: false, message: 'Tank is not available.' };

    // Combine all required ingredients
    const requiredIngredients: { name: string; quantity: number }[] = [];
    recipe.malts?.forEach(m => requiredIngredients.push({ name: m.name, quantity: m.weight }));
    recipe.hops?.forEach(h => requiredIngredients.push({ name: h.name, quantity: h.weight }));
    recipe.yeasts?.forEach(y => requiredIngredients.push({ name: y.name, quantity: y.weight }));

    // Check inventory
    const missingItems: string[] = [];
    for (const req of requiredIngredients) {
      const invItem = inventory.find(i => i.name.toLowerCase().trim() === req.name.toLowerCase().trim());
      if (!invItem) {
        missingItems.push(`Unknown ingredient in warehouse: ${req.name}`);
      } else if (invItem.quantity < req.quantity) {
        missingItems.push(`Missing ${req.quantity - invItem.quantity} ${invItem.unit} of ${invItem.name}`);
      }
    }

    if (missingItems.length > 0) {
      return { success: false, message: `Insufficient inventory:\n${missingItems.join('\n')}` };
    }

    // Calculate new inventory
    const updatedInventoryItems: InventoryItem[] = [];
    const newInventory = inventory.map(item => {
      const req = requiredIngredients.find(r => r.name.toLowerCase().trim() === item.name.toLowerCase().trim());
      if (req) {
        const newQty = item.quantity - req.quantity;
        const u = {
          ...item,
          quantity: newQty,
          status: newQty === 0 ? 'Out of Stock' as any : newQty < 10 ? 'Low' as any : 'In Stock' as any
        };
        updatedInventoryItems.push(u);
        return u;
      }
      return item;
    });

    // Create Batch
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      recipeId,
      batchNumber: `B-${Math.floor(Math.random() * 10000)}`,
      stage: 'Preparation',
      startDate: new Date().toISOString().split('T')[0]
    };

    // Calculate new tank
    let updatedTank: Tank | null = null;
    const newTanks = tanks.map(t => {
      if (t.id === tankId) {
        updatedTank = {
          ...t,
          status: 'Brewing' as any,
          currentRecipeId: recipeId,
          currentBatchId: newBatch.id,
          startDate: new Date().toISOString().split('T')[0],
          currentOg: recipe.vitals?.originalGravity || 1.050
        };
        return updatedTank;
      }
      return t;
    });

    // Perform state updates
    setInventory(newInventory);
    setBatches([...batches, newBatch]);
    setTanks(newTanks);

    // Perform side effects
    updatedInventoryItems.forEach(u => saveInventoryItem(u));
    if (updatedTank) saveTank(updatedTank);
    saveBatch(newBatch);
    
    saveBatch(newBatch);

    addLog('STARTED_BREW', `Started brewing ${recipe.name} in tank ${tank.name}`);
    sendLineNotification(`Started brewing ${recipe.name} in tank ${tank.name}`);
    return { success: true, message: 'Brew started successfully!' };
  };

  const cancelBrew = (tankId: string) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank || tank.status === 'Empty' || !tank.currentRecipeId) {
      return { success: false, message: 'Tank is already empty or invalid.' };
    }

    const recipe = recipes.find(r => r.id === tank.currentRecipeId);

    // Refund inventory if recipe is found
    const updatedInventoryItems: InventoryItem[] = [];
    if (recipe) {
      const requiredIngredients: { name: string; quantity: number }[] = [];
      recipe.malts?.forEach(m => requiredIngredients.push({ name: m.name, quantity: m.weight }));
      recipe.hops?.forEach(h => requiredIngredients.push({ name: h.name, quantity: h.weight }));
      recipe.yeasts?.forEach(y => requiredIngredients.push({ name: y.name, quantity: y.weight }));

      const newInventory = inventory.map(item => {
        const req = requiredIngredients.find(r => r.name.toLowerCase().trim() === item.name.toLowerCase().trim());
        if (req) {
          const newQty = item.quantity + req.quantity;
          const u = {
            ...item,
            quantity: newQty,
            status: newQty === 0 ? 'Out of Stock' as any : newQty < 10 ? 'Low' as any : 'In Stock' as any
          };
          updatedInventoryItems.push(u);
          return u;
        }
        return item;
      });
      setInventory(newInventory);
    }

    // Remove batch
    if (tank.currentBatchId) {
      setBatches(batches.filter(b => b.id !== tank.currentBatchId));
      removeBatch(tank.currentBatchId);
    }

    // Reset tank
    let resetTank: Tank | null = null;
    const newTanks = tanks.map(t => {
      if (t.id === tankId) {
        resetTank = {
          ...t,
          status: 'Empty' as any,
          currentRecipeId: undefined,
          currentBatchId: undefined,
          startDate: undefined,
          currentOg: undefined
        };
        return resetTank;
      }
      return t;
    });
    setTanks(newTanks);

    // Perform side effects
    updatedInventoryItems.forEach(u => saveInventoryItem(u));
    if (resetTank) saveTank(resetTank);

    addLog('CANCELLED_BREW', `Cancelled brew in tank ${tank.name} and refunded ingredients.`);
    return { success: true, message: 'Brew cancelled successfully.' };
  };

  const updateTankOg = (tankId: string, og: number) => {
    setTanks(tanks.map(t => t.id === tankId ? { ...t, currentOg: og } : t));
    const t = tanks.find(t => t.id === tankId);
    if(t) saveTank({ ...t, currentOg: og });
  };

  const updateTankPh = (tankId: string, ph: number) => {
    setTanks(tanks.map(t => t.id === tankId ? { ...t, currentPh: ph } : t));
    const t = tanks.find(t => t.id === tankId);
    if(t) saveTank({ ...t, currentPh: ph });
  };

  const toggleDryHop = (tankId: string, completed: boolean) => {
    setTanks(tanks.map(t => t.id === tankId ? { ...t, dryHopCompleted: completed } : t));
    const t = tanks.find(t => t.id === tankId);
    if(t) saveTank({ ...t, dryHopCompleted: completed });
  };

  const coldCrashTank = (tankId: string) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank || tank.status !== 'Brewing') {
      return { success: false, message: 'Tank must be in Brewing state to cold crash.' };
    }

    let updatedTank: Tank | null = null;
    const newTanks = tanks.map(t => {
      if (t.id === tankId) {
        updatedTank = { ...t, status: 'ColdCrash' as any, coldCrashStartDate: new Date().toISOString().split('T')[0] };
        return updatedTank;
      }
      return t;
    });
    setTanks(newTanks);

    let updatedBatch: Batch | null = null;
    if (tank.currentBatchId) {
      const newBatches = batches.map(b => {
        if (b.id === tank.currentBatchId) {
          updatedBatch = { ...b, stage: 'Conditioning' as any };
          return updatedBatch;
        }
        return b;
      });
      setBatches(newBatches);
    }

    if (updatedTank) saveTank(updatedTank);
    if (updatedBatch) saveBatch(updatedBatch);

    addLog('COLD_CRASH', `Started cold crash for tank ${tank.name}`);
    sendLineNotification(`Initiated cold crash for tank ${tank.name}`);
    return { success: true, message: 'Cold crash initiated.' };
  };

  const packageKegs = (tankId: string, totalKegs: number, litersPerKeg: number, pricePerKeg: number, shippingCost: number, fg: number) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank || tank.status !== 'ColdCrash' || !tank.currentBatchId || !tank.currentRecipeId) {
      return { success: false, message: 'Tank must be in Cold Crash state to package kegs.' };
    }

    const batch = batches.find(b => b.id === tank.currentBatchId);
    if (!batch) return { success: false, message: 'Batch not found.' };

    const newKegBatch: KegBatch = {
      id: `keg-b-${Date.now()}`,
      batchId: batch.id,
      recipeId: tank.currentRecipeId,
      batchNumber: batch.batchNumber,
      totalKegs,
      availableKegs: totalKegs,
      litersPerKeg,
      pricePerKeg,
      shippingCost,
      datePackaged: new Date().toISOString().split('T')[0],
      reservations: []
    };

    setKegBatches([newKegBatch, ...kegBatches]);
    saveKegBatch(newKegBatch);

    // Complete batch
    let updatedBatch: Batch | null = null;
    const newBatches = batches.map(b => {
      if(b.id === batch.id) {
        updatedBatch = { ...b, stage: 'Packaged' as any, specificGravity: fg };
        return updatedBatch;
      }
      return b;
    });
    setBatches(newBatches);

    // Empty tank
    let updatedTank: Tank | null = null;
    const newTanks = tanks.map(t => {
      if (t.id === tankId) {
        updatedTank = {
          ...t,
          status: 'Empty' as any,
          currentRecipeId: undefined,
          currentBatchId: undefined,
          startDate: undefined,
          currentOg: undefined
        };
        return updatedTank;
      }
      return t;
    });
    setTanks(newTanks);

    if (updatedBatch) saveBatch(updatedBatch);
    if (updatedTank) saveTank(updatedTank);

    addLog('PACKAGED_KEGS', `Packaged ${totalKegs} kegs (${litersPerKeg}L each) from tank ${tank.name}`);
    sendLineNotification(`Packaged ${totalKegs} kegs (${litersPerKeg}L each) from tank ${tank.name}`);
    return { success: true, message: 'Successfully packaged kegs and emptied tank.' };
  };

  // ค้นหาฟังก์ชัน addKegReservation ในไฟล์ของคุณแล้วแก้เป็นส่วนนี้ครับ

  const addKegReservation = (kegBatchId: string, customerName: string, shopName: string, quantity: number) => {
    const kegBatch = kegBatches.find(kb => kb.id === kegBatchId);
    if (!kegBatch) return { success: false, message: 'Keg batch not found.' };

    if (quantity > kegBatch.availableKegs) {
      return { success: false, message: `Only ${kegBatch.availableKegs} kegs available.` };
    }

    const reservation: KegReservation = {
      id: `res-${Date.now()}`,
      customerName,
      shopName,
      quantity,
      dateReserved: new Date().toISOString().split('T')[0],
      status: 'Pending Payment' // <--- เพิ่มบรรทัดนี้เข้าไปเพื่อให้ตรงตาม Type KegReservation
    };

    let updatedKegBatch: KegBatch | null = null;
    const newKegBatches = kegBatches.map(kb => {
      if (kb.id === kegBatchId) {
        updatedKegBatch = {
          ...kb,
          availableKegs: kb.availableKegs - quantity,
          reservations: [...kb.reservations, reservation]
        };
        return updatedKegBatch;
      }
      return kb;
    });
    setKegBatches(newKegBatches);
    if (updatedKegBatch) saveKegBatch(updatedKegBatch);

    addLog('KEG_RESERVATION', `Reserved ${quantity} kegs of ${kegBatch.batchNumber} for ${customerName} (${shopName})`);
    return { success: true, message: 'Reservation added successfully.' };
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}` // simple random id
    };
    setInventory(prev => [...prev, newItem]);
    saveInventoryItem(newItem);
    addLog('ADDED_INVENTORY', `Added ${item.quantity} ${item.unit} of ${item.name}`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    let updatedItem: InventoryItem | null = null;
    const newInventory = inventory.map(item => {
      if(item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    setInventory(newInventory);
    if (updatedItem) saveInventoryItem(updatedItem);
    addLog('UPDATED_INVENTORY', `Updated item ID: ${id}`);
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(item => item.id !== id));
    removeInventoryItem(id);
    addLog('DELETED_INVENTORY', `Deleted inventory item: ${item?.name || id}`);
  };

  const addSupplier = (name: string) => {
    if (!suppliers.includes(name)) {
      setSuppliers(prev => [...prev, name]);
      addLog('ADDED_SUPPLIER', `Added new supplier: ${name}`);
    }
  };

  const deleteSupplier = (name: string) => {
    setSuppliers(prev => prev.filter(s => s !== name));
    addLog('DELETED_SUPPLIER', `Removed supplier: ${name}`);
  };

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `rec-${Date.now()}`
    };
    setRecipes(prev => [...prev, newRecipe]);
    saveRecipe(newRecipe);
    addLog('ADDED_RECIPE', `Created new recipe: ${recipe.name}`);
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    let updatedRecipe: Recipe | null = null;
    const newRecipes = recipes.map(recipe => {
      if(recipe.id === id) {
        updatedRecipe = { ...recipe, ...updates };
        return updatedRecipe;
      }
      return recipe;
    });
    setRecipes(newRecipes);
    if (updatedRecipe) saveRecipe(updatedRecipe);
    addLog('UPDATED_RECIPE', `Updated recipe ID: ${id}`);
  };

  const deleteRecipe = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    setRecipes(prev => prev.filter(r => r.id !== id));
    removeRecipe(id);
    addLog('DELETED_RECIPE', `Deleted recipe: ${recipe?.name || id}`);
  };

  return (
    <BrewContext.Provider value={{
      tanks,
      inventory,
      suppliers,
      recipes,
      logs,
      batches,
      kegBatches,
      startBrew,
      cancelBrew,
      updateTankOg,
      updateTankPh,
      toggleDryHop,
      coldCrashTank,
      packageKegs,
      addKegReservation,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addSupplier,
      deleteSupplier,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      addLog
    }}>
      {children}
    </BrewContext.Provider>
  );
}

export function useBrew() {
  const context = useContext(BrewContext);
  if (context === undefined) {
    throw new Error('useBrew must be used within a BrewProvider');
  }
  return context;
}

