import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, Check, X, MessageSquare } from 'lucide-react';
import { ArtisanProduct, ArtisanProfile } from '@/types/artisan';

interface PendingWorkshop {
  id: string;
  title: string;
  description: string;
  artisanName: string;
  artisanId: string;
  duration: number;
  price: number;
  maxParticipants: number;
  materials: string[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  submittedAt: Date;
  adminNotes?: string;
}

interface ValidationManagerProps {
  pendingProducts: ArtisanProduct[];
  pendingWorkshops: PendingWorkshop[];
  pendingProfiles: ArtisanProfile[];
  onValidateProduct: (id: string, action: 'approve' | 'reject', notes?: string) => void;
  onValidateWorkshop: (id: string, action: 'approve' | 'reject', notes?: string) => void;
  onValidateProfile: (id: string, action: 'approve' | 'reject', notes?: string) => void;
}

export const ValidationManager: React.FC<ValidationManagerProps> = ({
  pendingProducts,
  pendingWorkshops,
  pendingProfiles,
  onValidateProduct,
  onValidateWorkshop,
  onValidateProfile
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleValidation = (action: 'approve' | 'reject', type: 'product' | 'workshop' | 'profile') => {
    if (!selectedItem) return;

    if (type === 'product') {
      onValidateProduct(selectedItem.id, action, validationNotes);
    } else if (type === 'workshop') {
      onValidateWorkshop(selectedItem.id, action, validationNotes);
    } else if (type === 'profile') {
      onValidateProfile(selectedItem.id, action, validationNotes);
    }

    setDialogOpen(false);
    setValidationNotes('');
    setSelectedItem(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
      pending_approval: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Validation des contenus artisans</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {pendingProducts.filter(p => p.status === 'pending_approval').length} produits en attente
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            {pendingWorkshops.filter(w => w.status === 'pending_approval').length} ateliers en attente
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {pendingProfiles.filter(p => p.status === 'pending_approval').length} profils en attente
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">Profils artisans à valider</TabsTrigger>
          <TabsTrigger value="products">Produits à valider</TabsTrigger>
          <TabsTrigger value="workshops">Ateliers à valider</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {pendingProfiles.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg">{profile.name}</h3>
                      <Badge className={
                        profile.artisanType === 'artizaho' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }>
                        {profile.artisanType === 'artizaho' ? 'Artisan Artizaho' : 'Artisan Uber'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{profile.about}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                      <div>
                        <span className="font-medium">Spécialités:</span> {profile.specialties.join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Localisation:</span> {profile.location.city}, {profile.location.region}
                      </div>
                      <div>
                        <span className="font-medium">Expérience ateliers:</span> 
                        {profile.businessInfo.workshopExperience === 'none' && ' Aucune'}
                        {profile.businessInfo.workshopExperience === 'beginner' && ' Débutant'}
                        {profile.businessInfo.workshopExperience === 'experienced' && ' Expérimenté'}
                      </div>
                      <div>
                        <span className="font-medium">Canaux de vente:</span> {profile.businessInfo.currentSalesChannels.join(', ')}
                      </div>
                    </div>
                    
                    {/* Distinction claire du type d'artisan */}
                    <div className="p-3 rounded-lg mb-3 border-l-4 border-l-orange-500 bg-orange-50">
                      <p className="text-sm font-medium text-orange-800">
                        {profile.artisanType === 'artizaho' ? (
                          <span>
                            🔧 <strong>Artisan Artizaho:</strong> Petit artisan vendant généralement en marque blanche sur Facebook/autres canaux. 
                            N'a jamais fait d'ateliers auparavant. Artizaho l'accompagne dans sa première expérience d'ateliers.
                          </span>
                        ) : (
                          <span>
                            🏆 <strong>Artisan Uber:</strong> Marque établie avec ses propres lignes de produits. 
                            Fait déjà des ateliers. Artizaho sera un nouveau canal de vente pour eux.
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Description de l'activité:</span>
                      <p className="text-gray-600 mt-1">{profile.businessInfo.businessDescription}</p>
                    </div>

                    {profile.adminNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium text-blue-800">Notes admin:</span>
                        <span className="text-blue-700 ml-1">{profile.adminNotes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadge(profile.status).color}>
                      {getStatusBadge(profile.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir profil complet
                  </Button>

                  {profile.status === 'pending_approval' && (
                    <>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setSelectedItem(profile)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approuver
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approuver le profil artisan</DialogTitle>
                            <DialogDescription>
                              Le profil sera publié et l'artisan pourra commencer à vendre
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
                                onClick={() => handleValidation('approve', 'profile')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmer l'approbation
                              </Button>
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedItem(profile)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rejeter le profil artisan</DialogTitle>
                            <DialogDescription>
                              Expliquez les raisons du rejet à l'artisan
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="rejection-notes">Raisons du rejet *</Label>
                              <Textarea
                                id="rejection-notes"
                                value={validationNotes}
                                onChange={(e) => setValidationNotes(e.target.value)}
                                placeholder="Expliquez pourquoi ce profil est rejeté..."
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleValidation('reject', 'profile')}
                                variant="destructive"
                                disabled={!validationNotes.trim()}
                              >
                                Confirmer le rejet
                              </Button>
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {pendingProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Par: {product.artisanId}</span>
                      <span>•</span>
                      <span>Catégorie: {product.category}</span>
                      <span>•</span>
                      <span>Prix: {product.price.toLocaleString()} Ar</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                    {product.adminNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium text-blue-800">Notes admin:</span>
                        <span className="text-blue-700 ml-1">{product.adminNotes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadge(product.status).color}>
                      {getStatusBadge(product.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItem(product)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Détails du produit</DialogTitle>
                        <DialogDescription>
                          Examinez le produit avant validation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Informations générales</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Nom:</span> {product.name}
                            </div>
                            <div>
                              <span className="font-medium">Catégorie:</span> {product.category}
                            </div>
                            <div>
                              <span className="font-medium">Prix:</span> {product.price.toLocaleString()} Ar
                            </div>
                            <div>
                              <span className="font-medium">Stock:</span> {product.stock}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Matériaux:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.materials.map((material, index) => (
                              <Badge key={index} variant="outline">{material}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {product.status === 'pending_approval' && (
                    <>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setSelectedItem(product)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approuver
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approuver le produit</DialogTitle>
                            <DialogDescription>
                              Le produit sera publié sur la plateforme
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
                                onClick={() => handleValidation('approve', 'product')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmer l'approbation
                              </Button>
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedItem(product)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rejeter le produit</DialogTitle>
                            <DialogDescription>
                              Expliquez les raisons du rejet à l'artisan
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="rejection-notes">Raisons du rejet *</Label>
                              <Textarea
                                id="rejection-notes"
                                value={validationNotes}
                                onChange={(e) => setValidationNotes(e.target.value)}
                                placeholder="Expliquez pourquoi ce produit est rejeté..."
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleValidation('reject', 'product')}
                                variant="destructive"
                                disabled={!validationNotes.trim()}
                              >
                                Confirmer le rejet
                              </Button>
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="workshops" className="space-y-4">
          {pendingWorkshops.map((workshop) => (
            <Card key={workshop.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{workshop.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{workshop.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Par: {workshop.artisanName}</span>
                      <span>•</span>
                      <span>Durée: {workshop.duration}h</span>
                      <span>•</span>
                      <span>Prix: {workshop.price.toLocaleString()} Ar</span>
                      <span>•</span>
                      <span>Max: {workshop.maxParticipants} personnes</span>
                    </div>
                    {workshop.adminNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium text-blue-800">Notes admin:</span>
                        <span className="text-blue-700 ml-1">{workshop.adminNotes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadge(workshop.status).color}>
                      {getStatusBadge(workshop.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>

                  {workshop.status === 'pending_approval' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onValidateWorkshop(workshop.id, 'approve')}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onValidateWorkshop(workshop.id, 'reject')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};