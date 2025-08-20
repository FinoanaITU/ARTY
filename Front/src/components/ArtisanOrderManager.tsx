import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Order {
  id: number;
  customer: string;
  items: string[];
  total: number;
  date: string;
  status: 'delivered' | 'shipped' | 'pending';
}

interface ArtisanOrderManagerProps {
  orders: Order[];
}

export const ArtisanOrderManager: React.FC<ArtisanOrderManagerProps> = ({ orders }) => {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">Commande #{order.id}</h3>
                <p className="text-sm text-gray-600">Client: {order.customer}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                order.status === 'delivered' 
                  ? 'bg-green-100 text-green-700' 
                  : order.status === 'shipped'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {order.status === 'delivered' ? 'Livré' : 
                 order.status === 'shipped' ? 'Expédié' : 'En attente'}
              </span>
            </div>
            <div className="space-y-1 mb-3">
              {order.items.map((item, index) => (
                <p key={index} className="text-sm text-gray-600">• {item}</p>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(order.date).toLocaleDateString('fr-FR')}
              </span>
              <span className="font-semibold text-orange-600">
                {order.total.toLocaleString()} Ar
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      {orders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Aucune commande pour le moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};