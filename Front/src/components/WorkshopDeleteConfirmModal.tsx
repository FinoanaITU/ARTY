import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, X } from 'lucide-react';
import type { WorkshopOut } from '@/types/workshop';

interface WorkshopDeleteConfirmModalProps {
  workshop: WorkshopOut | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WorkshopDeleteConfirmModal: React.FC<WorkshopDeleteConfirmModalProps> = ({
  workshop,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen || !workshop) return null;

  const hasBookings = workshop.total_bookings && workshop.total_bookings > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-red-900">
                    Supprimer l'atelier
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    Cette action est irréversible
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-1">
                {workshop.title}
              </p>
              <p className="text-sm text-gray-600">
                {workshop.category} • {workshop.skill_level}
              </p>
              {hasBookings && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Cet atelier a {workshop.total_bookings} réservation(s)
                </p>
              )}
            </div>

            <div className="text-sm text-gray-700 space-y-2">
              <p>
                Êtes-vous sûr de vouloir supprimer cet atelier ? Cette action :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Supprimera définitivement l'atelier</li>
                <li>Supprimera toutes les photos associées</li>
                {hasBookings && (
                  <li className="text-red-600 font-medium">
                    Annulera toutes les réservations existantes
                  </li>
                )}
                <li>Ne pourra pas être annulée</li>
              </ul>
            </div>

            {hasBookings && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  Attention : Les participants seront automatiquement notifiés de l'annulation.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};