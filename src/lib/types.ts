export type Product = {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  location: string;
  category: string;
  createdAt: string;
  sellerId: string | null;
  seller?: { name: string | null; email: string } | null;
};

export type Veterinarian = {
  id: number;
  name: string;
  imageUrl: string;
  specialization: string;
  bio: string;
  location: string;
};

export type Booking = {
  id: number;
  date: string;
  timeSlot: string;
  status: string;
  notes: string;
  createdAt: string;
  veterinarian: Veterinarian;
};

export type OrderItem = {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  productId: number | null;
};

export type Payment = {
  id: number;
  provider: string;
  status: "PENDING" | "PAID" | "FAILED";
  amount: number;
  phone: string;
  mpesaReceipt: string;
  resultDesc: string;
  simulated: boolean;
};

export type Order = {
  id: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  createdAt: string;
  items: OrderItem[];
  payment: Payment | null;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}
