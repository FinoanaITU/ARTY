import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, AlertCircle, Package, Phone, Mail } from 'lucide-react';

interface DetailedOrder {
  id: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    specifications?: string;
  }>;
  total: number;
  date: string;
  status: 'pending' | 'in_production' | 'ready' | 'shipped' | 'delivered';
  deliveryAddress: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
    instructions?: string;
  };
  specialRequests?: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

interface DetailedOrderManagerProps {
  orders: DetailedOrder[];
}

export const DetailedOrderManager: React.FC<DetailedOrderManagerProps> = ({ orders }) => {
  const getStatusBadge = (status: DetailedOrder['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-700' },
      in_production: { label: 'En production', variant: 'default' as const, color: 'bg-blue-100 text-blue-700' },
      ready: { label: 'Prêt', variant: 'default' as const, color: 'bg-green-100 text-green-700' },
      shipped: { label: 'Expédié', variant: 'default' as const, color: 'bg-purple-100 text-purple-700' },
      delivered: { label: 'Livré', variant: 'default' as const, color: 'bg-emerald-100 text-emerald-700' }
    };
    return statusConfig[status];
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Commande #{order.id}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(order.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge className={getStatusBadge(order.status).color}>
                {getStatusBadge(order.status).label}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informations client */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-600" />
                  Informations client
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nom:</span> {order.customer.name}</p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {order.customer.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {order.customer.phone}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Adresse de livraison
                </h4>
                <div className="space-y-1 text-sm">
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.region}</p>
                  {order.deliveryAddress.postalCode && (
                    <p>Code postal: {order.deliveryAddress.postalCode}</p>
                  )}
                  {order.deliveryAddress.instructions && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                      <p className="text-xs font-medium">Instructions de livraison:</p>
                      <p className="text-xs">{order.deliveryAddress.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Articles commandés */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Articles commandés</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Quantité: {item.quantity}</p>
                      {item.specifications && (
                        <p className="text-xs text-blue-700 mt-1">
                          Spécifications: {item.specifications}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">
                        {(item.price * item.quantity).toLocaleString()} Ar
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.price.toLocaleString()} Ar/unité
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requêtes spéciales */}
            {order.specialRequests && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Requêtes spéciales</p>
                    <p className="text-sm text-yellow-700">{order.specialRequests}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Informations de livraison et total */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Livraison estimée: {new Date(order.estimatedDelivery).toLocaleDateString('fr-FR')}</span>
                {order.trackingNumber && (
                  <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Suivi: {order.trackingNumber}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-orange-600">
                  Total: {order.total.toLocaleString()} Ar
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline">
                Contacter le client
              </Button>
              <Button size="sm" variant="outline">
                Mettre à jour le statut
              </Button>
              {order.status === 'ready' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Marquer comme expédié
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};