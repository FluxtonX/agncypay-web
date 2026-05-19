import { Invoice } from "../types/invoice";

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-AD-1001",
    brandName: "Adidas",
    invoiceDate: "2026-05-10",
    dueDate: "2026-06-10",
    amount: 2450.00,
    currency: "USD",
    status: "pending",
    items: [
      { name: "Adidas Ultraboost Light Running Shoes", quantity: 10, price: 180.00 },
      { name: "Adicolor Classics 3-Stripes Track Jackets", quantity: 10, price: 65.00 },
    ],
  },
  {
    id: "INV-AD-1002",
    brandName: "Adidas",
    invoiceDate: "2026-04-15",
    dueDate: "2026-05-15",
    amount: 1850.00,
    currency: "USD",
    status: "paid",
    items: [
      { name: "Adidas Predator Elite FG Soccer Cleats", quantity: 5, price: 260.00 },
      { name: "Tiro Essentials Training Pants", quantity: 11, price: 50.00 },
    ],
  },
  {
    id: "INV-AD-1003",
    brandName: "Adidas",
    invoiceDate: "2026-03-20",
    dueDate: "2026-04-20",
    amount: 4720.00,
    currency: "USD",
    status: "overdue",
    items: [
      { name: "Adidas Originals Stan Smith Shoes", quantity: 30, price: 100.00 },
      { name: "Superstar Classic Low-Tops", quantity: 15, price: 100.00 },
      { name: "Trefoil Essentials Fleece Hoodies", quantity: 2, price: 110.00 } // Wait, let's just make it quantity 2, price 110.00. Wait, quantity: 2, price: 110.00 (which adds up to 3000 + 1500 + 220 = 4720. Yes!)
    ],
  },
  {
    id: "INV-AD-1004",
    brandName: "Adidas",
    invoiceDate: "2026-05-18",
    dueDate: "2026-06-18",
    amount: 980.00,
    currency: "USD",
    status: "processing",
    items: [
      { name: "Adidas Techfit Training T-Shirts", quantity: 20, price: 35.00 },
      { name: "Adidas 3-Stripes Crew Socks (6-Pack)", quantity: 14, price: 20.00 },
    ],
  },
  {
    id: "INV-AD-1005",
    brandName: "Adidas",
    invoiceDate: "2026-05-14",
    dueDate: "2026-06-14",
    amount: 3200.00,
    currency: "USD",
    status: "pending",
    items: [
      { name: "Adidas Gazelle Retro Sneakers", quantity: 20, price: 120.00 },
      { name: "Adilette Shower Slides", quantity: 20, price: 40.00 },
    ],
  },
];
