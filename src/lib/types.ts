export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}
