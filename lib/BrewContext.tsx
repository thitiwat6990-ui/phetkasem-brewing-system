"use client";

import React, { createContext, useContext, useState } from 'react';
import { Tank, InventoryItem, Recipe, LogEntry, Batch, KegBatch, KegReservation, MOCK_TANKS, MOCK_INVENTORY, MOCK_RECIPES, MOCK_SUPPLIERS, MOCK_BATCHES, MOCK_KEG_BATCHES } from './mockData';

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
  coldCrashTank: (tankId: string) => { success: boolean; message: string };
  packageKegs: (tankId: string, totalKegs: number, litersPerKeg: number, pricePerKeg: number, shippingCost: number) => { success: boolean; message: string };
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

  const addLog = (action: string, details: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Brewer', // Defaulting to Brewer for now
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const startBrew = (tankId: string, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Recipe not found.' };

    const tank = tanks.find(t => t.id === tankId);
    if (!tank || tank.status !== 'Empty') return { success: false, message: 'Tank is not available.' };

    // Check inventory
    const missingItems: string[] = [];
    for (const ing of recipe.ingredients) {
      const invItem = inventory.find(i => i.id === ing.itemId);
      if (!invItem) {
        missingItems.push(`Unknown ingredient (ID: ${ing.itemId})`);
      } else if (invItem.quantity < ing.quantity) {
        missingItems.push(`Missing ${ing.quantity - invItem.quantity} ${invItem.unit} of ${invItem.name}`);
      }
    }
    
    if (missingItems.length > 0) {
      return { success: false, message: `Insufficient inventory:\n${missingItems.join('\n')}` };
    }

    // Deduct inventory
    setInventory(prev => prev.map(item => {
      const recipeIng = recipe.ingredients.find(i => i.itemId === item.id);
      if (recipeIng) {
        const newQty = item.quantity - recipeIng.quantity;
        return {
          ...item,
          quantity: newQty,
          status: newQty === 0 ? 'Out of Stock' : newQty < 10 ? 'Low' : 'In Stock'
        };
      }
      return item;
    }));

    // Create Batch
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      recipeId,
      batchNumber: `B-${Math.floor(Math.random() * 10000)}`,
      stage: 'Preparation',
      startDate: new Date().toISOString().split('T')[0]
    };
    setBatches(prev => [...prev, newBatch]);

    // Update tank
    setTanks(prev => prev.map(t => {
      if (t.id === tankId) {
        return { 
          ...t, 
          status: 'Brewing', 
          currentRecipeId: recipeId, 
          currentBatchId: newBatch.id,
          startDate: new Date().toISOString().split('T')[0],
          currentOg: recipe.vitals?.originalGravity || 1.050
        };
      }
      return t;
    }));

    addLog('STARTED_BREW', `Started brewing ${recipe.name} in tank ${tank.name}`);
    return { success: true, message: 'Brew started successfully!' };
  };

  const cancelBrew = (tankId: string) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank || tank.status === 'Empty' || !tank.currentRecipeId) {
      return { success: false, message: 'Tank is already empty or invalid.' };
    }

    const recipe = recipes.find(r => r.id === tank.currentRecipeId);
    
    // Refund inventory if recipe is found
    if (recipe) {
      setInventory(prev => prev.map(item => {
        const recipeIng = recipe.ingredients.find(i => i.itemId === item.id);
        if (recipeIng) {
          const newQty = item.quantity + recipeIng.quantity;
          return {
            ...item,
            quantity: newQty,
            status: newQty === 0 ? 'Out of Stock' : newQty < 10 ? 'Low' : 'In Stock'
          };
        }
        return item;
      }));
    }

    // Remove batch
    if (tank.currentBatchId) {
      setBatches(prev => prev.filter(b => b.id !== tank.currentBatchId));
    }

    // Reset tank
    setTanks(prev => prev.map(t => {
      if (t.id === tankId) {
        return { 
          ...t, 
          status: 'Empty', 
          currentRecipeId: undefined, 
          currentBatchId: undefined,
          startDate: undefined,
          currentOg: undefined
        };
      }
      return t;
    }));

    addLog('CANCELLED_BREW', `Cancelled brew in tank ${tank.name} and refunded ingredients.`);
    return { success: true, message: 'Brew cancelled successfully.' };
  };

  const updateTankOg = (tankId: string, og: number) => {
    setTanks(prev => prev.map(t => {
      if (t.id === tankId) {
        return { ...t, currentOg: og };
      }
      return t;
    }));
    const tank = tanks.find(t => t.id === tankId);
    if (tank) {
      addLog('UPDATED_OG', `Updated OG to ${og.toFixed(3)} for tank ${tank.name}`);
    }
  };

  const coldCrashTank = (tankId: string) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank || tank.status !== 'Brewing') {
      return { success: false, message: 'Tank must be in Brewing state to cold crash.' };
    }

    setTanks(prev => prev.map(t => {
      if (t.id === tankId) return { ...t, status: 'ColdCrash' };
      return t;
    }));

    if (tank.currentBatchId) {
      setBatches(prev => prev.map(b => b.id === tank.currentBatchId ? { ...b, stage: 'Conditioning' } : b));
    }

    addLog('COLD_CRASH', `Started cold crash for tank ${tank.name}`);
    return { success: true, message: 'Cold crash initiated.' };
  };

  const packageKegs = (tankId: string, totalKegs: number, litersPerKeg: number, pricePerKeg: number, shippingCost: number) => {
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

    setKegBatches(prev => [newKegBatch, ...prev]);

    // Complete batch
    setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, stage: 'Packaged', specificGravity: tank.currentOg } : b));

    // Empty tank
    setTanks(prev => prev.map(t => {
      if (t.id === tankId) {
        return { 
          ...t, 
          status: 'Empty', 
          currentRecipeId: undefined, 
          currentBatchId: undefined,
          startDate: undefined,
          currentOg: undefined
        };
      }
      return t;
    }));

    addLog('PACKAGED_KEGS', `Packaged ${totalKegs} kegs (${litersPerKeg}L each) from tank ${tank.name}`);
    return { success: true, message: 'Successfully packaged kegs and emptied tank.' };
  };

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
      status: 'Pending Payment'
    };

    setKegBatches(prev => prev.map(kb => {
      if (kb.id === kegBatchId) {
        return {
          ...kb,
          availableKegs: kb.availableKegs - quantity,
          reservations: [...kb.reservations, reservation]
        };
      }
      return kb;
    }));

    addLog('KEG_RESERVATION', `Reserved ${quantity} kegs of ${kegBatch.batchNumber} for ${customerName} (${shopName})`);
    return { success: true, message: 'Reservation added successfully.' };
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}` // simple random id
    };
    setInventory(prev => [...prev, newItem]);
    addLog('ADDED_INVENTORY', `Added ${item.quantity} ${item.unit} of ${item.name}`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    addLog('UPDATED_INVENTORY', `Updated item ID: ${id}`);
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(item => item.id !== id));
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
    addLog('ADDED_RECIPE', `Created new recipe: ${recipe.name}`);
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? { ...recipe, ...updates } : recipe
    ));
    addLog('UPDATED_RECIPE', `Updated recipe ID: ${id}`);
  };

  const deleteRecipe = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    setRecipes(prev => prev.filter(r => r.id !== id));
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

