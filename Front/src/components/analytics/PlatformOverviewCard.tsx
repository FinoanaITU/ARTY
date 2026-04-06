import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PlatformOverview } from '@/types/admin';

interface PlatformOverviewCardProps {
  data: PlatformOverview;
}

export const PlatformOverviewCard: React.FC<PlatformOverviewCardProps> = ({ data }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>Répartition par rôle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {data.total_users}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">Acheteurs</span>
                <span className="text-blue-700 font-semibold">{data.users_by_role.buyers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-orange-900">Artisans</span>
                <span className="text-orange-700 font-semibold">{data.users_by_role.artisans}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-900">Admins</span>
                <span className="text-purple-700 font-semibold">{data.users_by_role.admins}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Artisans</CardTitle>
          <CardDescription>État de la communauté</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {data.total_artisans.total}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Actifs</span>
                <span className="text-green-700 font-semibold">{data.total_artisans.active || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-900">En attente</span>
                <span className="text-yellow-700 font-semibold">{data.total_artisans.pending || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
          <CardDescription>Catalogue de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {data.total_products.total}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Publiés</span>
                <span className="text-green-700 font-semibold">{data.total_products.published}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-orange-900">En attente</span>
                <span className="text-orange-700 font-semibold">{data.total_products.pending}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Ateliers</CardTitle>
          <CardDescription>Offres de formation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {data.total_workshops.total}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-900">Publiés</span>
                <span className="text-purple-700 font-semibold">{data.total_workshops.published}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <span className="font-medium text-pink-900">En attente</span>
                <span className="text-pink-700 font-semibold">{data.total_workshops.pending}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Activité de la plateforme</CardTitle>
          <CardDescription>Commandes et réservations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Commandes totales</p>
              <p className="text-3xl font-bold text-blue-700">{data.total_orders}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-1">Réservations d'ateliers</p>
              <p className="text-3xl font-bold text-purple-700">{data.total_bookings}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-1">Validations en attente</p>
              <p className="text-3xl font-bold text-orange-700">{data.pending_validations}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
