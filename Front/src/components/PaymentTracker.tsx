import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export interface PaymentStatus {
  id: string;
  type: 'workshop' | 'product';
  title: string;
  artisanName: string;
  artisanType: 'artizaho' | 'uber';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'pending_collection';
  paymentMethod?: 'cash' | 'mobile_money' | 'bank_transfer';
  clientName: string;
  bookingDate: Date;
  workshopDate?: Date;
  paymentHistory: Array<{
    date: Date;
    amount: number;
    method: string;
    note?: string;
  }>;
  notes?: string;
}

interface PaymentTrackerProps {
  payments: PaymentStatus[];
  onUpdatePayment: (id: string, update: Partial<PaymentStatus>) => void;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({ 
  payments, 
  onUpdatePayment 
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const getPaymentStatusBadge = (status: string, paidAmount: number, totalAmount: number) => {
    const percentage = (paidAmount / totalAmount) * 100;
    
    switch (status) {
      case 'unpaid':
        return { label: 'Non payé', color: 'bg-red-100 text-red-700' };
      case 'partial':
        return { 
          label: `${percentage.toFixed(0)}% payé`, 
          color: 'bg-yellow-100 text-yellow-700' 
        };
      case 'paid':
        return { label: 'Payé intégralement', color: 'bg-green-100 text-green-700' };
      case 'pending_collection':
        return { 
          label: 'À récupérer fin atelier', 
          color: 'bg-orange-100 text-orange-700' 
        };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getArtisanTypeBadge = (type: 'artizaho' | 'uber') => {
    return type === 'artizaho' 
      ? { label: 'Artisan Artizaho', color: 'bg-blue-100 text-blue-700' }
      : { label: 'Artisan Uber', color: 'bg-purple-100 text-purple-700' };
  };

  const handleAddPayment = () => {
    if (!selectedPayment || !newPaymentAmount || !paymentMethod) return;

    const amount = parseFloat(newPaymentAmount);
    const updatedPaidAmount = selectedPayment.paidAmount + amount;
    const updatedRemainingAmount = selectedPayment.totalAmount - updatedPaidAmount;
    
    let newStatus: string = selectedPayment.paymentStatus;
    if (updatedRemainingAmount <= 0) {
      newStatus = 'paid';
    } else if (updatedPaidAmount > 0) {
      newStatus = 'partial';
    }

    const newPaymentHistory = [
      ...selectedPayment.paymentHistory,
      {
        date: new Date(),
        amount,
        method: paymentMethod,
        note: paymentNote
      }
    ];

    onUpdatePayment(selectedPayment.id, {
      paidAmount: updatedPaidAmount,
      remainingAmount: Math.max(0, updatedRemainingAmount),
      paymentStatus: newStatus as any,
      paymentHistory: newPaymentHistory
    });

    setNewPaymentAmount('');
    setPaymentMethod('');
    setPaymentNote('');
    setDialogOpen(false);
  };

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    onUpdatePayment(paymentId, { paymentStatus: newStatus as any });
  };

  // Statistiques des paiements
  const paymentStats = {
    total: payments.length,
    unpaid: payments.filter(p => p.paymentStatus === 'unpaid').length,
    partial: payments.filter(p => p.paymentStatus === 'partial').length,
    paid: payments.filter(p => p.paymentStatus === 'paid').length,
    pendingCollection: payments.filter(p => p.paymentStatus === 'pending_collection').length,
    totalRevenue: payments.reduce((sum, p) => sum + p.paidAmount, 0),
    pendingRevenue: payments.reduce((sum, p) => sum + p.remainingAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {paymentStats.totalRevenue.toLocaleString()} Ar
            </div>
            <p className="text-sm text-gray-600">Revenus perçus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {paymentStats.pendingRevenue.toLocaleString()} Ar
            </div>
            <p className="text-sm text-gray-600">À récupérer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {paymentStats.partial}
            </div>
            <p className="text-sm text-gray-600">Paiements partiels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {paymentStats.unpaid}
            </div>
            <p className="text-sm text-gray-600">Non payés</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des paiements */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tous ({paymentStats.total})</TabsTrigger>
          <TabsTrigger value="unpaid">Non payés ({paymentStats.unpaid})</TabsTrigger>
          <TabsTrigger value="partial">Partiels ({paymentStats.partial})</TabsTrigger>
          <TabsTrigger value="pending">À récupérer ({paymentStats.pendingCollection})</TabsTrigger>
          <TabsTrigger value="paid">Payés ({paymentStats.paid})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {payments.map((payment) => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              onUpdateStatus={handleStatusChange}
              onManagePayment={(p) => {
                setSelectedPayment(p);
                setDialogOpen(true);
              }}
            />
          ))}
        </TabsContent>

        <TabsContent value="unpaid" className="space-y-4">
          {payments.filter(p => p.paymentStatus === 'unpaid').map((payment) => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              onUpdateStatus={handleStatusChange}
              onManagePayment={(p) => {
                setSelectedPayment(p);
                setDialogOpen(true);
              }}
            />
          ))}
        </TabsContent>

        <TabsContent value="partial" className="space-y-4">
          {payments.filter(p => p.paymentStatus === 'partial').map((payment) => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              onUpdateStatus={handleStatusChange}
              onManagePayment={(p) => {
                setSelectedPayment(p);
                setDialogOpen(true);
              }}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {payments.filter(p => p.paymentStatus === 'pending_collection').map((payment) => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              onUpdateStatus={handleStatusChange}
              onManagePayment={(p) => {
                setSelectedPayment(p);
                setDialogOpen(true);
              }}
            />
          ))}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {payments.filter(p => p.paymentStatus === 'paid').map((payment) => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              onUpdateStatus={handleStatusChange}
              onManagePayment={(p) => {
                setSelectedPayment(p);
                setDialogOpen(true);
              }}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialog pour gérer les paiements */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gérer le paiement</DialogTitle>
            <DialogDescription>
              {selectedPayment?.title} - {selectedPayment?.clientName}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Résumé du paiement */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total:</span>
                    <div className="text-lg font-bold">{selectedPayment.totalAmount.toLocaleString()} Ar</div>
                  </div>
                  <div>
                    <span className="font-medium">Payé:</span>
                    <div className="text-lg font-bold text-green-600">{selectedPayment.paidAmount.toLocaleString()} Ar</div>
                  </div>
                  <div>
                    <span className="font-medium">Restant:</span>
                    <div className="text-lg font-bold text-orange-600">{selectedPayment.remainingAmount.toLocaleString()} Ar</div>
                  </div>
                </div>
              </div>

              {/* Historique des paiements */}
              {selectedPayment.paymentHistory.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Historique des paiements</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedPayment.paymentHistory.map((history, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white border rounded">
                        <div>
                          <div className="text-sm font-medium">{history.amount.toLocaleString()} Ar</div>
                          <div className="text-xs text-gray-500">
                            {history.date.toLocaleDateString('fr-FR')} - {history.method}
                          </div>
                          {history.note && <div className="text-xs text-gray-400">{history.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ajouter un paiement */}
              {selectedPayment.remainingAmount > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Ajouter un paiement</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-amount">Montant payé</Label>
                      <Input
                        id="payment-amount"
                        type="number"
                        value={newPaymentAmount}
                        onChange={(e) => setNewPaymentAmount(e.target.value)}
                        placeholder="Montant en Ar"
                        max={selectedPayment.remainingAmount}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment-method">Méthode de paiement</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir méthode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="payment-note">Note (optionnel)</Label>
                    <Textarea
                      id="payment-note"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="Commentaire sur le paiement..."
                    />
                  </div>
                  <Button 
                    onClick={handleAddPayment}
                    disabled={!newPaymentAmount || !paymentMethod}
                    className="w-full"
                  >
                    Enregistrer le paiement
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Composant PaymentCard séparé pour la lisibilité
const PaymentCard: React.FC<{
  payment: PaymentStatus;
  onUpdateStatus: (id: string, status: string) => void;
  onManagePayment: (payment: PaymentStatus) => void;
}> = ({ payment, onUpdateStatus, onManagePayment }) => {
  const getPaymentStatusBadge = (status: string, paidAmount: number, totalAmount: number) => {
    const percentage = (paidAmount / totalAmount) * 100;
    
    switch (status) {
      case 'unpaid':
        return { label: 'Non payé', color: 'bg-red-100 text-red-700' };
      case 'partial':
        return { 
          label: `${percentage.toFixed(0)}% payé`, 
          color: 'bg-yellow-100 text-yellow-700' 
        };
      case 'paid':
        return { label: 'Payé intégralement', color: 'bg-green-100 text-green-700' };
      case 'pending_collection':
        return { 
          label: 'À récupérer fin atelier', 
          color: 'bg-orange-100 text-orange-700' 
        };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getArtisanTypeBadge = (type: 'artizaho' | 'uber') => {
    return type === 'artizaho' 
      ? { label: 'Artisan Artizaho', color: 'bg-blue-100 text-blue-700' }
      : { label: 'Artisan Uber', color: 'bg-purple-100 text-purple-700' };
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-lg">{payment.title}</h3>
              <Badge className={getArtisanTypeBadge(payment.artisanType).color}>
                {getArtisanTypeBadge(payment.artisanType).label}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Client:</span> {payment.clientName}
              </div>
              <div>
                <span className="font-medium">Artisan:</span> {payment.artisanName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Réservation:</span> {payment.bookingDate.toLocaleDateString('fr-FR')}
              </div>
              {payment.workshopDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Atelier:</span> {payment.workshopDate.toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          </div>
          <Badge className={getPaymentStatusBadge(payment.paymentStatus, payment.paidAmount, payment.totalAmount).color}>
            {getPaymentStatusBadge(payment.paymentStatus, payment.paidAmount, payment.totalAmount).label}
          </Badge>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {payment.paidAmount.toLocaleString()} Ar
              </div>
              <div className="text-xs text-gray-500">Payé</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {payment.remainingAmount.toLocaleString()} Ar
              </div>
              <div className="text-xs text-gray-500">Restant</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {payment.totalAmount.toLocaleString()} Ar
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManagePayment(payment)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Gérer paiement
          </Button>
          
          {payment.paymentStatus === 'partial' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(payment.id, 'pending_collection')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Marquer "À récupérer"
            </Button>
          )}

          {payment.paymentStatus === 'pending_collection' && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onUpdateStatus(payment.id, 'paid')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marquer comme payé
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};