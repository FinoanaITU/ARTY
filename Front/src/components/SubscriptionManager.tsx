import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Subscription } from '@/types/workshop';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onUpdateSubscription: (id: string, updates: Partial<Subscription>) => void;
  onDeleteSubscription: (id: string) => void;
}

const subscriptionPlans = {
  basic: {
    name: 'Basic',
    price: 9900,
    features: ['Accès aux ateliers', 'Support par email']
  },
  premium: {
    name: 'Premium', 
    price: 19900,
    features: ['Accès aux ateliers', 'Ateliers privés', 'Support prioritaire']
  },
  pro: {
    name: 'Pro',
    price: 39900,
    features: ['Accès complet', 'Ateliers privés', 'Support dédié', 'Formations avancées']
  }
};

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  subscriptions,
  onUpdateSubscription,
  onDeleteSubscription
}) => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    autoRenew: false,
    endDate: ''
  });

  const getStatusBadge = (status: Subscription['status']) => {
    const statusConfig = {
      active: { label: 'Actif', variant: 'default' as const },
      cancelled: { label: 'Annulé', variant: 'secondary' as const },
      expired: { label: 'Expiré', variant: 'destructive' as const },
      pending: { label: 'En attente', variant: 'secondary' as const }
    };
    return statusConfig[status];
  };

  const getPlanBadge = (plan: Subscription['plan']) => {
    const planConfig = {
      basic: { label: 'Basic', variant: 'secondary' as const },
      premium: { label: 'Premium', variant: 'default' as const },
      pro: { label: 'Pro', variant: 'default' as const }
    };
    return planConfig[plan];
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsViewModalOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditData({
      status: subscription.status,
      autoRenew: subscription.autoRenew,
      endDate: format(subscription.endDate, 'yyyy-MM-dd')
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubscription = () => {
    if (!selectedSubscription) return;

    onUpdateSubscription(selectedSubscription.id, {
      status: editData.status as Subscription['status'],
      autoRenew: editData.autoRenew,
      endDate: new Date(editData.endDate),
      updatedAt: new Date()
    });

    toast({
      title: "Abonnement mis à jour",
      description: "Les informations de l'abonnement ont été mises à jour"
    });

    setIsEditModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    onUpdateSubscription(subscriptionId, {
      status: 'cancelled',
      autoRenew: false,
      updatedAt: new Date()
    });

    toast({
      title: "Abonnement annulé",
      description: "L'abonnement a été annulé avec succès"
    });
  };

  const stats = {
    totalActive: subscriptions.filter(sub => sub.status === 'active').length,
    totalRevenue: subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.price, 0),
    totalCancelled: subscriptions.filter(sub => sub.status === 'cancelled').length,
    totalExpired: subscriptions.filter(sub => sub.status === 'expired').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Abonnements</h2>
        <p className="text-gray-600">Gérez les abonnements des utilisateurs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalActive}
            </div>
            <p className="text-sm text-gray-600">Abonnements actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(stats.totalRevenue / 1000).toFixed(0)}k Ar
            </div>
            <p className="text-sm text-gray-600">Revenus mensuels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.totalCancelled}
            </div>
            <p className="text-sm text-gray-600">Annulés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.totalExpired}
            </div>
            <p className="text-sm text-gray-600">Expirés</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements</CardTitle>
          <CardDescription>
            {subscriptions.length} abonnement{subscriptions.length > 1 ? 's' : ''} total{subscriptions.length > 1 ? 'aux' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Renouvellement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => {
                const statusConfig = getStatusBadge(subscription.status);
                const planConfig = getPlanBadge(subscription.plan);
                return (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.userName}</div>
                        <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={planConfig.variant}>{planConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell>{subscription.price.toLocaleString()} Ar</TableCell>
                    <TableCell>{format(subscription.startDate, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(subscription.endDate, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {subscription.autoRenew ? (
                        <Badge variant="default">Automatique</Badge>
                      ) : (
                        <Badge variant="secondary">Manuel</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSubscription(subscription)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubscription(subscription)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {subscription.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Subscription Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'abonnement</DialogTitle>
            <DialogDescription>
              Abonnement #{selectedSubscription?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informations utilisateur</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nom:</strong> {selectedSubscription.userName}</p>
                    <p><strong>Email:</strong> {selectedSubscription.userEmail}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Détails de l'abonnement</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Plan:</strong> {subscriptionPlans[selectedSubscription.plan].name}</p>
                    <p><strong>Prix:</strong> {selectedSubscription.price.toLocaleString()} Ar</p>
                    <p><strong>Statut:</strong> <Badge variant={getStatusBadge(selectedSubscription.status).variant}>
                      {getStatusBadge(selectedSubscription.status).label}
                    </Badge></p>
                    <p><strong>Renouvellement:</strong> {selectedSubscription.autoRenew ? 'Automatique' : 'Manuel'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités incluses</h4>
                <ul className="space-y-1 text-sm">
                  {selectedSubscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Date de début</div>
                  <div className="font-medium">
                    {format(selectedSubscription.startDate, 'PPP', { locale: fr })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Date de fin</div>
                  <div className="font-medium">
                    {format(selectedSubscription.endDate, 'PPP', { locale: fr })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Créé le</div>
                  <div className="font-medium">
                    {format(selectedSubscription.createdAt, 'PP', { locale: fr })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'abonnement</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de l'abonnement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={editData.endDate}
                onChange={(e) => setEditData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="autoRenew"
                checked={editData.autoRenew}
                onCheckedChange={(checked) => setEditData(prev => ({ ...prev, autoRenew: checked }))}
              />
              <Label htmlFor="autoRenew">Renouvellement automatique</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateSubscription} className="bg-orange-600 hover:bg-orange-700">
              Sauvegarder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};