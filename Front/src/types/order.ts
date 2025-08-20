export interface Order {
  id: number;
  date: string;
  artisan: string;
  items: string[];
  total: number;
  status: 'delivered' | 'shipped' | 'pending' | 'in_production' | 'ready_for_pickup';
  pickupDate?: Date;
  productionEndDate?: Date;
  estimatedDeliveryDate?: Date;
}

export interface OrderUpdate {
  id: number;
  pickupDate?: Date;
  productionEndDate?: Date;
  estimatedDeliveryDate?: Date;
}