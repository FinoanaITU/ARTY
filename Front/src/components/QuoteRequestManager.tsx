import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MessageSquare, Check, X, DollarSign } from 'lucide-react';
import { QuoteRequest } from '@/types/workshop';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface QuoteRequestManagerProps {
  quoteRequests: QuoteRequest[];
  onUpdateQuoteRequest: (id: string, updates: Partial<QuoteRequest>) => void;
}

export const QuoteRequestManager: React.FC<QuoteRequestManagerProps> = ({
  quoteRequests,
  onUpdateQuoteRequest
}) => {
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [finalPrice, setFinalPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const getStatusBadge = (status: QuoteRequest['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      quoted: { label: 'Devis envoyé', variant: 'default' as const },
      approved: { label: 'Approuvé', variant: 'default' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
      completed: { label: 'Terminé', variant: 'default' as const }
    };
    return statusConfig[status];
  };

  const getClientTypeBadge = (type: QuoteRequest['clientType']) => {
    return type === 'particulier' ? 'Particulier' : 'Entreprise';
  };

  const handleViewRequest = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleQuoteRequest = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setFinalPrice(request.finalPrice?.toString() || '');
    setAdminNotes(request.adminNotes || '');
    setIsQuoteModalOpen(true);
  };

  const handleSubmitQuote = () => {
    if (!selectedRequest || !finalPrice) return;

    onUpdateQuoteRequest(selectedRequest.id, {
      finalPrice: parseInt(finalPrice),
      status: 'quoted',
      adminNotes: adminNotes,
      updatedAt: new Date()
    });

    toast({
      title: "Devis envoyé",
      description: "Le devis a été envoyé au client avec succès"
    });

    setIsQuoteModalOpen(false);
    setSelectedRequest(null);
    setFinalPrice('');
    setAdminNotes('');
  };

  const handleApprove = (requestId: string) => {
    onUpdateQuoteRequest(requestId, {
      status: 'approved',
      updatedAt: new Date()
    });

    toast({
      title: "Demande approuvée",
      description: "La demande de devis a été approuvée"
    });
  };

  const handleReject = (requestId: string) => {
    onUpdateQuoteRequest(requestId, {
      status: 'rejected',
      updatedAt: new Date()
    });

    toast({
      title: "Demande rejetée",
      description: "La demande de devis a été rejetée"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Demandes de Devis</h2>
        <p className="text-gray-600">Gérez les demandes de devis pour les ateliers sur réservation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demandes de devis</CardTitle>
          <CardDescription>
            {quoteRequests.length} demande{quoteRequests.length > 1 ? 's' : ''} en cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Atelier</TableHead>
                <TableHead>Date souhaitée</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Prix estimé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteRequests.map((request) => {
                const statusConfig = getStatusBadge(request.status);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.clientInfo.name}</div>
                        <div className="text-sm text-gray-500">{request.clientInfo.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getClientTypeBadge(request.clientType)}</Badge>
                    </TableCell>
                    <TableCell>{request.workshopTitle}</TableCell>
                    <TableCell>
                      {format(request.eventDetails.preferredDate, 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{request.eventDetails.participants}</TableCell>
                    <TableCell>
                      {request.estimatedPrice ? `${request.estimatedPrice.toLocaleString()} Ar` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuoteRequest(request)}
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
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

      {/* View Request Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande de devis</DialogTitle>
            <DialogDescription>
              Demande #{selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informations client</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nom:</strong> {selectedRequest.clientInfo.name}</p>
                    <p><strong>Email:</strong> {selectedRequest.clientInfo.email}</p>
                    <p><strong>Téléphone:</strong> {selectedRequest.clientInfo.phone}</p>
                    {selectedRequest.clientInfo.whatsapp && (
                      <p><strong>WhatsApp:</strong> {selectedRequest.clientInfo.whatsapp}</p>
                    )}
                    {selectedRequest.clientInfo.company && (
                      <p><strong>Entreprise:</strong> {selectedRequest.clientInfo.company}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Détails de l'événement</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Atelier:</strong> {selectedRequest.workshopTitle}</p>
                    <p><strong>Participants:</strong> {selectedRequest.eventDetails.participants}</p>
                    <p><strong>Lieu:</strong> {selectedRequest.eventDetails.location}</p>
                    <p><strong>Date préférée:</strong> {format(selectedRequest.eventDetails.preferredDate, 'PPP', { locale: fr })}</p>
                    {selectedRequest.eventDetails.alternativeDate && (
                      <p><strong>Date alternative:</strong> {format(selectedRequest.eventDetails.alternativeDate, 'PPP', { locale: fr })}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedRequest.specialRequirements && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Exigences spéciales</h4>
                  <p className="text-sm text-gray-600">{selectedRequest.specialRequirements}</p>
                </div>
              )}
              
              {selectedRequest.adminNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes administratives</h4>
                  <p className="text-sm text-gray-600">{selectedRequest.adminNotes}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Badge variant={getStatusBadge(selectedRequest.status).variant}>
                  {getStatusBadge(selectedRequest.status).label}
                </Badge>
                <div className="text-sm text-gray-500">
                  Créé le {format(selectedRequest.createdAt, 'PPP', { locale: fr })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un devis</DialogTitle>
            <DialogDescription>
              Proposez un prix pour cette demande de devis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="finalPrice">Prix final (Ar) *</Label>
              <Input
                id="finalPrice"
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="Entrez le prix final"
              />
            </div>
            
            <div>
              <Label htmlFor="adminNotes">Notes (optionnel)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ajoutez des notes ou commentaires pour le client"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitQuote} className="bg-orange-600 hover:bg-orange-700">
              Envoyer le devis
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};