export const MANUFACTURERS: Record<string, string[]> = {
    "Dell": ["OptiPlex 3000", "OptiPlex 5000", "OptiPlex 7000", "Latitude 3000", "Latitude 5000", "Latitude 7000", "Precision 3000", "Precision 5000", "Precision 7000", "XPS 13", "XPS 15", "XPS 17", "PowerEdge T40", "PowerEdge T150", "PowerEdge R250", "P2422H", "P2723D", "U2722D", "U3223QE", "S2722DC"],
    "HP": ["ProDesk 400", "ProDesk 600", "EliteDesk 800", "ProBook 450", "ProBook 650", "EliteBook 840", "EliteBook 850", "ZBook Firefly", "ZBook Power", "ZBook Fury", "LaserJet Pro", "LaserJet Enterprise", "Color LaserJet", "ScanJet Pro", "ScanJet Enterprise", "E24 G5", "E27 G5", "Z27", "Z32"],
    "Lenovo": ["ThinkCentre M70", "ThinkCentre M90", "ThinkPad E14", "ThinkPad E15", "ThinkPad T14", "ThinkPad T15", "ThinkPad X1 Carbon", "ThinkStation P300", "ThinkStation P500", "ThinkServer"],
    "Apple": ["MacBook Air M1", "MacBook Air M2", "MacBook Pro 13", "MacBook Pro 14", "MacBook Pro 16", "iMac 24", "Mac mini", "Mac Studio", "Studio Display", "Pro Display XDR"],
    "Samsung": ["S24R350 24inch", "S27R350 27inch", "S32R750 32inch", "M5 27inch", "M7 32inch", "M7 43inch", "Odyssey G5", "Odyssey G7", "Odyssey Neo G9", "970 EVO Plus SSD", "980 PRO SSD", "990 PRO SSD", "870 EVO SSD", "870 QVO SSD", "860 EVO SSD", "T7 Portable SSD", "T7 Shield SSD", "X5 Portable SSD"],
    "LG": ["24MK430H 24inch", "27UL500 27inch", "32UN500 32inch", "UltraWide 29WP60G", "UltraWide 34WN80C", "UltraFine 27UP850"],
    "Cisco": ["Catalyst 9200", "Catalyst 9300", "ISR 1000", "ISR 4000", "Meraki MR", "Meraki MS", "Meraki MX"],
    "Western Digital": ["WD Blue 1TB", "WD Blue 2TB", "WD Black 1TB", "WD Black 2TB", "WD Red Plus 2TB", "WD Red Plus 4TB", "WD Red Pro 6TB", "WD Purple 2TB", "WD Gold 4TB", "My Passport 2TB", "Elements 4TB"],
    "Seagate": ["BarraCuda 1TB", "BarraCuda 2TB", "BarraCuda Pro 4TB", "IronWolf 4TB", "IronWolf Pro 8TB", "FireCuda 2TB", "Exos X18 16TB", "Backup Plus 4TB", "Expansion 6TB"],
    "Kingston": ["A400 SSD", "KC3000 SSD", "NV2 SSD", "Fury Beast DDR4", "Fury Beast DDR5", "ValueRAM DDR4"],
    "Crucial": ["MX500 SSD", "P3 Plus SSD", "P5 Plus SSD", "DDR4-3200", "DDR5-4800"],
    "Other": []
}

export const INVENTORY_CATEGORIES = [
    { value: "Desktop", label: "كمبيوتر مكتبي" },
    { value: "Laptop", label: "كمبيوتر محمول" },
    { value: "Monitor", label: "شاشة" },
    { value: "Server", label: "سيرفر" },
    { value: "Printer", label: "طابعة" },
    { value: "Scanner", label: "اسكانر" },
    { value: "Hard Disk", label: "هاردديسك" },
    { value: "RAM", label: "ذاكرة" },
    { value: "Processor", label: "معالج" },
    { value: "Keyboard", label: "لوحة مفاتيح" },
    { value: "Mouse", label: "ماوس" },
    { value: "OTHER", label: "أخرى" },
]