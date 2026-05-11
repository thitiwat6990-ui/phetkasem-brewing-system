"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'th';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    // Sidebar
    'Dashboard': 'Dashboard',
    'Inventory': 'Inventory',
    'Keg Stock': 'Keg Stock',
    'Batch Tracker': 'Batch Tracker',
    'Recipes': 'Recipes',
    'History': 'History',
    'Admin': 'Admin',
    'SYSTEM ADMIN': 'SYSTEM ADMIN',
    'BREWER': 'BREWER',
    'Phetkasem brewery system': 'Phetkasem brewery system',
    
    // Dashboard
    'Brewery Overview': 'Brewery Overview',
    'Monitor your production zones and fermentor tanks.': 'Monitor your production zones and fermentor tanks.',
    'Available Tanks': 'Available Tanks',
    'Batches Brewed': 'Batches Brewed',
    'Low Inventory': 'Low Inventory',
    'Total Production': 'Total Production',
    'Zone': 'Zone',
    'Capacity': 'Capacity',
    'Monthly Brews Summary': 'Monthly Brews Summary',
    'Distribution of recipes brewed in the selected period.': 'Distribution of recipes brewed in the selected period.',
    'Most Brewed': 'Most Brewed',
    'batches': 'batches',
    'Gravity Accuracy (Target vs Actual OG)': 'Gravity Accuracy (Target vs Actual OG)',
    'Comparing recipe target original gravity against actual reading.': 'Comparing recipe target original gravity against actual reading.',
    'No batches found in this date range.': 'No batches found in this date range.',
    'to': 'to',
    'From Date': 'From Date',
    'To Date': 'To Date',
    
    // Inventory
    'Inventory Management': 'Inventory Management',
    'Track raw materials and packaging supplies.': 'Track raw materials and packaging supplies.',
    'Manage Suppliers': 'Manage Suppliers',
    'Add Item': 'Add Item',
    'Item Name': 'Item Name',
    'Category': 'Category',
    'Quantity': 'Quantity',
    'Unit': 'Unit',
    'Status': 'Status',
    'Actions': 'Actions',

    // Kegs
    'Keg Stock & Sales': 'Keg Stock & Sales',
    'Manage packaged kegs, track reservations, and view sales analytics.': 'Manage packaged kegs, track reservations, and view sales analytics.',
    'Total Revenue': 'Total Revenue',
    'Total Kegs Sold': 'Total Kegs Sold',
    'Active Keg Batches': 'Active Keg Batches',
    'Best Selling Recipes': 'Best Selling Recipes',
    'Top recipes by kegs sold.': 'Top recipes by kegs sold.',
    'Current Keg Stock': 'Current Keg Stock',

    // Batches
    'Monitor brewing stages across all active and past batches.': 'Monitor brewing stages across all active and past batches.',
    'Batch Number': 'Batch Number',
    'Date / Time': 'Date / Time',
    'Recipe Name': 'Recipe Name',
    'Style': 'Style',
    'OG': 'OG',
    'FG': 'FG',
    'Tank': 'Tank',
    'No batches found': 'No batches found',

    // Recipes
    'Recipe Library': 'Recipe Library',
    'Manage and explore your brewing recipes.': 'Manage and explore your brewing recipes.',
    'New Recipe': 'New Recipe',
  },
  th: {
    // Sidebar
    'Dashboard': 'หน้าหลัก',
    'Inventory': 'คลังวัตถุดิบ',
    'Keg Stock': 'คลังถังเบียร์',
    'Batch Tracker': 'ติดตามการผลิต',
    'Recipes': 'สูตรเบียร์',
    'History': 'ประวัติ',
    'Admin': 'ผู้ดูแลระบบ',
    'SYSTEM ADMIN': 'ผู้ดูแลระบบ',
    'BREWER': 'พนักงานต้มเบียร์',
    'Phetkasem brewery system': 'ระบบโรงเบียร์เพชรเกษม',
    
    // Dashboard
    'Brewery Overview': 'ภาพรวมโรงเบียร์',
    'Monitor your production zones and fermentor tanks.': 'ตรวจสอบโซนการผลิตและถังหมักของคุณ',
    'Available Tanks': 'ถังว่าง',
    'Batches Brewed': 'จำนวนแบตช์ที่ผลิต',
    'Low Inventory': 'วัตถุดิบใกล้หมด',
    'Total Production': 'ปริมาณการผลิตรวม',
    'Zone': 'โซน',
    'Capacity': 'ความจุ',
    'Monthly Brews Summary': 'สรุปการผลิตรายเดือน',
    'Distribution of recipes brewed in the selected period.': 'สัดส่วนสูตรที่ผลิตในช่วงเวลาที่เลือก',
    'Most Brewed': 'ผลิตบ่อยสุด',
    'batches': 'แบตช์',
    'Gravity Accuracy (Target vs Actual OG)': 'ความแม่นยำของความถ่วงจำเพาะ (เป้าหมาย vs จริง)',
    'Comparing recipe target original gravity against actual reading.': 'เปรียบเทียบค่า OG เป้าหมายของสูตรกับค่าที่วัดได้จริง',
    'No batches found in this date range.': 'ไม่พบแบตช์ในช่วงวันที่นี้',
    'to': 'ถึง',
    'From Date': 'ตั้งแต่วันที่',
    'To Date': 'ถึงวันที่',

    // Inventory
    'Inventory Management': 'จัดการคลังวัตถุดิบ',
    'Track raw materials and packaging supplies.': 'ติดตามวัตถุดิบและบรรจุภัณฑ์',
    'Manage Suppliers': 'จัดการซัพพลายเออร์',
    'Add Item': 'เพิ่มรายการ',
    'Item Name': 'ชื่อรายการ',
    'Category': 'หมวดหมู่',
    'Quantity': 'จำนวน',
    'Unit': 'หน่วย',
    'Status': 'สถานะ',
    'Actions': 'จัดการ',

    // Kegs
    'Keg Stock & Sales': 'คลังถังเบียร์และการขาย',
    'Manage packaged kegs, track reservations, and view sales analytics.': 'จัดการถังเบียร์ ติดตามการจอง และดูข้อมูลการขาย',
    'Total Revenue': 'รายได้รวม',
    'Total Kegs Sold': 'ถังเบียร์ที่ขายได้',
    'Active Keg Batches': 'แบตช์ที่ยังขายอยู่',
    'Best Selling Recipes': 'สูตรที่ขายดีที่สุด',
    'Top recipes by kegs sold.': 'สูตรเบียร์ยอดนิยมตามจำนวนที่ขาย',
    'Current Keg Stock': 'คลังถังเบียร์ปัจจุบัน',

    // Batches
    'Monitor brewing stages across all active and past batches.': 'ตรวจสอบขั้นตอนการต้มของแบตช์ทั้งหมด',
    'Batch Number': 'เลขแบตช์',
    'Date / Time': 'วันที่ / เวลา',
    'Recipe Name': 'ชื่อสูตร',
    'Style': 'สไตล์',
    'OG': 'OG',
    'FG': 'FG',
    'Tank': 'ถังหมัก',
    'No batches found': 'ไม่พบแบตช์',

    // Recipes
    'Recipe Library': 'คลังสูตรเบียร์',
    'Manage and explore your brewing recipes.': 'จัดการและค้นหาสูตรการต้มเบียร์ของคุณ',
    'New Recipe': 'สูตรใหม่',
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load preference from localStorage
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'th')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
