import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { 
  SubscriptionOut, 
  SubscriptionHistoryOut,
  SubscriptionCancelRequest,
  SubscriptionExtendRequest,
  SubscriptionAddCreditsRequest
} from '@/types/admin';
import apiService from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  XCircle, 
  Clock, 
  Plus, 
  History,
  User,
  CreditCard,
  Calendar,
  Package,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionDetailProps {
  subscription: SubscriptionOut;
  onBack: () => void;
  onUpdate: () => void;
}

/**
 * Vue détaillée d'un abonnement avec actions admin
 */
export const SubscriptionDetail: React.FC<SubscriptionDetailProps> = ({
  subscription,
  onBack,
  onUpdate
}) => {
  const [history, setHistory] = useState<SubscriptionHistoryOut[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Modals
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  
  // Form data
  const [cancelReason, setCancelReason] = useState('');
  const [extendDays, setExtendDays] = useState('30');
  const [extendNotes, setExtendNotes] = useState('');
  const [creditsAmount, setCreditsAmount] = useState('');
  const [creditsReason, setCreditsReason] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [subscription.id]);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await apiService.getSubscriptionHistory(subscription.id, 0, 50);
      setHistory(response.history);
    } catch (err: any) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      const data: SubscriptionCancelRequest = {
        reason: cancelReason || undefined
      };
      await apiService.cancelSubscription(subscription.id, data);
      toast({
        title: 'Succès',
        description: 'L\'abonnement a été annulé'
      });
      setCancelModalOpen(false);
      onUpdate();
    } catch (err: any) {
      console.error('Erreur annulation:', err);
      toast({
        title: 'Erreur',
        description: err.response?.data?.detail || 'Impossible d\'annuler l\'abonnement',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendSubscription = async () => {
    try {
      setActionLoading(true);
      const data: SubscriptionExtendRequest = {
        days: parseInt(extendDays),
        notes: extendNotes || undefined
      };
      await apiService.extendSubscription(subscription.id, data);
      toast({
        title: 'Succès',
        description: `Abonnement prolongé de ${extendDays} jours`
      });
      setExtendModalOpen(false);
      setExtendDays('30');
      setExtendNotes('');
      onUpdate();
    } catch (err: any) {
      console.error('Erreur prolongation:', err);
      toast({
        title: 'Erreur',
        description: err.response?.data?.detail || 'Impossible de prolonger l\'abonnement',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCredits = async () => {
    try {
      setActionLoading(true);
      const data: SubscriptionAddCreditsRequest = {
        amount: parseFloat(creditsAmount),
        reason: creditsReason || undefined
      };
      await apiService.addBonusCredits(subscription.id, data);
      toast({
        title: 'Succès',
        description: `${creditsAmount} crédits ajoutés`
      });
      setCreditsModalOpen(false);
      setCreditsAmount('');
      setCreditsReason('');
      onUpdate();
    } catch (err: any) {
      console.error('Erreur ajout crédits:', err);
      toast({
        title: 'Erreur',
        description: err.response?.data?.detail || 'Impossible d\'ajouter les crédits',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: 'default' as const, label: 'Actif', className: 'bg-green-500' },
      paused: { variant: 'secondary' as const, label: 'En pause', className: 'bg-orange-500' },
      cancelled: { variant: 'destructive' as const, label: 'Annulé', className: 'bg-red-500' },
      expired: { variant: 'secondary' as const, label: 'Expiré', className: 'bg-gray-500' },
      pending: { variant: 'secondary' as const, label: 'En attente', className: 'bg-blue-500' }
    };
    const config = variants[status] || variants.active;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const canCancel = subscription.status === 'active' || subscription.status === 'paused';
  const canExtend = subscription.status === 'active' || subscription.status === 'paused';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h3 className="text-xl font-bold">Détails de l'abonnement</h3>
            <p className="text-sm text-gray-500">ID: {subscription.id}</p>
          </div>
          {getStatusBadge(subscription.status)}
        </div>
        
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          )}
          {canExtend && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExtendModalOpen(true)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Prolonger
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreditsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Crédits
          </Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{subscription.user_name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{subscription.user_email || subscription.user_id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg uppercase">{subscription.plan}</p>
            <p className="text-sm text-gray-500">{subscription.billing_cycle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Prix Mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg text-green-600">
              {formatCurrency(subscription.monthly_price)}
            </p>
            <p className="text-sm text-gray-500">Total dépensé: {formatCurrency(subscription.total_spent)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Crédits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg text-blue-600">{subscription.available_credits.toFixed(0)}</p>
            <p className="text-sm text-gray-500">
              Utilisés: {subscription.used_credits.toFixed(0)} | Bonus: {subscription.bonus_credits_added.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="text-gray-500">Début:</span>{' '}
              <span className="font-medium">
                {format(new Date(subscription.start_date), 'dd/MM/yyyy', { locale: fr })}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Fin:</span>{' '}
              <span className="font-medium">
                {format(new Date(subscription.end_date), 'dd/MM/yyyy', { locale: fr })}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{subscription.payment_method || 'N/A'}</p>
            <p className="text-sm text-gray-500">
              Auto-renew: {subscription.auto_renew ? 'Oui' : 'Non'}
            </p>
            <p className="text-sm text-gray-500">
              Renouvelé: {subscription.times_renewed} fois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Info */}
      {subscription.cancelled_at && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Information d'annulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">Date:</span>{' '}
              {format(new Date(subscription.cancelled_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
            </p>
            {subscription.cancellation_reason && (
              <p className="text-sm mt-2">
                <span className="font-medium">Raison:</span> {subscription.cancellation_reason}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      {subscription.admin_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes Administrateur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{subscription.admin_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des Modifications
          </CardTitle>
          <CardDescription>Audit trail complet de l'abonnement</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-sm text-gray-500 text-center py-4">Chargement...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Aucun historique</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Par</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {format(new Date(entry.action_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.action_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{entry.actor_name || 'Système'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{entry.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler l'abonnement</DialogTitle>
            <DialogDescription>
              Cette action annulera l'abonnement immédiatement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cancelReason">Raison (optionnel)</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Raison de l'annulation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={actionLoading}>
              {actionLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Modal */}
      <Dialog open={extendModalOpen} onOpenChange={setExtendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prolonger l'abonnement</DialogTitle>
            <DialogDescription>
              Ajoutez des jours supplémentaires à l'abonnement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="extendDays">Nombre de jours (1-365)</Label>
              <Input
                id="extendDays"
                type="number"
                min="1"
                max="365"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="extendNotes">Notes (optionnel)</Label>
              <Textarea
                id="extendNotes"
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                placeholder="Raison de la prolongation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleExtendSubscription} disabled={actionLoading}>
              {actionLoading ? 'Prolongation...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Modal */}
      <Dialog open={creditsModalOpen} onOpenChange={setCreditsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des crédits bonus</DialogTitle>
            <DialogDescription>
              Ajouter des crédits supplémentaires à l'abonnement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="creditsAmount">Montant (crédits)</Label>
              <Input
                id="creditsAmount"
                type="number"
                min="1"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(e.target.value)}
                placeholder="ex: 1000"
              />
            </div>
            <div>
              <Label htmlFor="creditsReason">Raison (optionnel)</Label>
              <Textarea
                id="creditsReason"
                value={creditsReason}
                onChange={(e) => setCreditsReason(e.target.value)}
                placeholder="Raison de l'ajout de crédits..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCredits} disabled={actionLoading || !creditsAmount}>
              {actionLoading ? 'Ajout...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
