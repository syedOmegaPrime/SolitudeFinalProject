"use client";

import type { Asset } from '@/types';
import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface AssetContextType {
  assets: Asset[];
  addAsset: (newAsset: Asset) => void;
}

const ASSETS_STORAGE_KEY = 'dynamicAssets';

export const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider = ({ children }: { children: ReactNode }) => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    if (typeof window !== 'undefined') {
      const storedAssetsString = localStorage.getItem(ASSETS_STORAGE_KEY);
      if (storedAssetsString) {
        try {
          const parsedData = JSON.parse(storedAssetsString);
          // Check if parsedData is an array and items look like assets (basic check)
          if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'object' && item !== null && 'id' in item && 'name' in item && 'price' in item)) {
            return parsedData as Asset[];
          } else {
            console.warn("Stored assets format is invalid. Re-initializing as empty and clearing localStorage for assets.");
            localStorage.removeItem(ASSETS_STORAGE_KEY); // Clear invalid data
            return [];
          }
        } catch (e) {
          console.error("Failed to parse stored assets. Re-initializing as empty and clearing localStorage for assets:", e);
          localStorage.removeItem(ASSETS_STORAGE_KEY); // Clear corrupted data
          return [];
        }
      }
    }
    return []; // Default to empty array if no stored assets or not in browser environment
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    }
  }, [assets]);

  const addAsset = (newAsset: Asset) => {
    setAssets(prevAssets => [newAsset, ...prevAssets]);
  };

  return (
    <AssetContext.Provider value={{ assets, addAsset }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};
