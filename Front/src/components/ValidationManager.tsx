import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Check, X, MessageSquare, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { PendingValidationItem, PendingValidationsResponse, ValidationStats, ValidationType } from '@/types/admin';

export const ValidationManager: React.FC = () => {
  const [validationsData, setValidationsData] = useState<PendingValidationsResponse | null>(null);
  const [validationStats, setValidationStats] = useState<ValidationStats | null>(null);
  const [selectedItem, setSelectedItem] = useState<PendingValidationItem | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statsPeriod, setStatsPeriod] = useState('month');

  
  const loadPendingValidations = async (validationType: string = 'all') => {
    setIsLoading(true);
    try {
      const data = await apiService.getAdminPendingValidations(
        validationType === 'all' ? undefined : validationType,
        0,
        50
      );
      setValidationsData(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de charger les validations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  
  const loadValidationStats = async () => {
    try {
      const stats = await apiService.getValidationStats(statsPeriod);
      setValidationStats(stats);
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  useEffect(() => {
    loadPendingValidations(activeTab);
    loadValidationStats();
  }, [activeTab, statsPeriod]);

  
  const handleValidation = async (
    item: PendingValidationItem,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    try {
      let response;
      
      switch (item.type) {
        case 'profile':
          response = await apiService.validateArtisanProfile(item.artisan_id, action, notes);
          break;
        case 'product':
          if (!item.entity_id) throw new Error('ID produit manquant');
          response = await apiService.validateProduct(item.entity_id, action, notes);
          break;
        case 'workshop':
          if (!item.entity_id) throw new Error('ID atelier manquant');
          response = await apiService.validateWorkshop(item.entity_id, action, notes);
          break;
        default:
          throw new Error('Type de validation non supporté');
      }

      toast({
        title: 'Succès',
        description: response.message || `${item.type} ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`,
      });

      
      loadPendingValidations(activeTab);
      loadValidationStats();
      
      
      setDialogOpen(false);
      setValidationNotes('');
      setSelectedItem(null);
      
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || error.message || 'Échec de la validation',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      pending_approval: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      profile: 'Profil artisan',
      product: 'Produit',
      workshop: 'Atelier'
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      profile: 'bg-blue-100 text-blue-700',
      product: 'bg-purple-100 text-purple-700',
      workshop: 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading && !validationsData) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Chargement des validations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validationsData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {validationsData?.count_by_type?.profile || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {validationsData?.count_by_type?.product || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ateliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {validationsData?.count_by_type?.workshop || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      {validationStats && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Statistiques de validation</CardTitle>
              <Select value={statsPeriod} onValueChange={setStatsPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total validations:</span>
                <div className="text-lg font-semibold">{validationStats.total_validations}</div>
              </div>
              <div>
                <span className="text-gray-600">Approuvés:</span>
                <div className="text-lg font-semibold text-green-600">{validationStats.approved_count}</div>
              </div>
              <div>
                <span className="text-gray-600">Rejetés:</span>
                <div className="text-lg font-semibold text-red-600">{validationStats.rejected_count}</div>
              </div>
              <div>
                <span className="text-gray-600">Taux d'approbation:</span>
                <div className="text-lg font-semibold text-blue-600">
                  {validationStats.approval_rate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Validations en attente</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadPendingValidations(activeTab)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Tous ({validationsData?.total || 0})
              </TabsTrigger>
              <TabsTrigger value="profile">
                Profils ({validationsData?.count_by_type?.profile || 0})
              </TabsTrigger>
              <TabsTrigger value="product">
                Produits ({validationsData?.count_by_type?.product || 0})
              </TabsTrigger>
              <TabsTrigger value="workshop">
                Ateliers ({validationsData?.count_by_type?.workshop || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {validationsData && validationsData.items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune validation en attente</p>
                </div>
              ) : (
                validationsData?.items.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeBadgeColor(item.type)}>
                              {getTypeLabel(item.type)}
                            </Badge>
                            <Badge className={getStatusBadge(item.status).color}>
                              {getStatusBadge(item.status).label}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-2">
                            <div>
                              <span className="font-medium">Artisan:</span> {item.artisan_name}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {item.artisan_email}
                            </div>
                            <div>
                              <span className="font-medium">Date de création:</span>{' '}
                              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>

                          {item.details && Object.keys(item.details).length > 0 && (
                            <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                              <span className="font-medium">Détails supplémentaires:</span>
                              <div className="mt-1 space-y-1">
                                {Object.entries(item.details).map(([key, value]) => (
                                  <div key={key} className="text-gray-600">
                                    <span className="capitalize">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approuver
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approuver {getTypeLabel(item.type)}</DialogTitle>
                              <DialogDescription>
                                Confirmez l'approbation de "{item.title}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="approval-notes">Notes (optionnel)</Label>
                                <Textarea
                                  id="approval-notes"
                                  value={validationNotes}
                                  onChange={(e) => setValidationNotes(e.target.value)}
                                  placeholder="Commentaires pour l'artisan..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    if (selectedItem) {
                                      handleValidation(selectedItem, 'approve', validationNotes);
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirmer l'approbation
                                </Button>
                                <Button variant="outline" onClick={() => setValidationNotes('')}>
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Bouton Rejeter */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedItem(item)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeter {getTypeLabel(item.type)}</DialogTitle>
                              <DialogDescription>
                                Expliquez les raisons du rejet de "{item.title}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="rejection-notes">
                                  Raisons du rejet <span className="text-red-600">*</span>
                                </Label>
                                <Textarea
                                  id="rejection-notes"
                                  value={validationNotes}
                                  onChange={(e) => setValidationNotes(e.target.value)}
                                  placeholder="Expliquez pourquoi ce contenu est rejeté..."
                                  required
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    if (selectedItem) {
                                      handleValidation(selectedItem, 'reject', validationNotes);
                                    }
                                  }}
                                  variant="destructive"
                                  disabled={!validationNotes.trim()}
                                >
                                  Confirmer le rejet
                                </Button>
                                <Button variant="outline" onClick={() => setValidationNotes('')}>
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
