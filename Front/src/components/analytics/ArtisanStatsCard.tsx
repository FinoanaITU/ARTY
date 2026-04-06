import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ArtisanStats } from '@/types/admin';
import { Users, Award, MapPin, TrendingUp } from 'lucide-react';

interface ArtisanStatsCardProps {
  data: ArtisanStats;
}

export const ArtisanStatsCard: React.FC<ArtisanStatsCardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Artisans</p>
                <p className="text-3xl font-bold text-gray-900">{data.total_artisans}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Artisans Actifs</p>
                <p className="text-3xl font-bold text-green-700">{data.active_artisans}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((data.active_artisans / data.total_artisans) * 100).toFixed(1)}% du total
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">En attente</p>
                <p className="text-3xl font-bold text-orange-700">{data.pending_approval}</p>
                <p className="text-xs text-gray-500 mt-1">À valider</p>
              </div>
              <Users className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Nouveaux ce mois</p>
              <p className="text-3xl font-bold text-purple-700">{data.new_this_month}</p>
            </div>
            <Badge variant="secondary" className="text-base px-4 py-2">
              +{data.new_this_month} artisans
            </Badge>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par spécialité</CardTitle>
          <CardDescription>Top 5 des spécialités les plus représentées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.by_specialty.slice(0, 5).map((specialty, index) => {
              const percentage = (specialty.count / data.total_artisans) * 100;
              const colors = [
                'bg-blue-500',
                'bg-purple-500',
                'bg-orange-500',
                'bg-green-500',
                'bg-pink-500'
              ];
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">{specialty.specialty}</span>
                    <span className="text-sm text-gray-600">
                      {specialty.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${colors[index]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par région</CardTitle>
          <CardDescription>Top 5 des régions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {data.by_region.slice(0, 5).map((region, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-900">{region.region}</span>
                </div>
                <Badge variant="secondary">{region.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Top 10 des artisans par revenus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.top_performers.slice(0, 10).map((performer, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.artisan_name}</p>
                    <p className="text-sm text-gray-600">{performer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-700">
                    {(performer.total_revenue / 1000).toFixed(0)}k Ar
                  </p>
                  {index === 0 && <Award className="h-5 w-5 text-yellow-500 inline ml-2" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
