import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { ArtisanProfile } from '@/types/artisan';
import { toast } from '@/hooks/use-toast';

interface ArtisanProfileEditorProps {
  profile?: ArtisanProfile;
  onSaveProfile: (profile: Omit<ArtisanProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const madagascarRegions = [
  'Antananarivo',
  'Fianarantsoa',
  'Toamasina',
  'Mahajanga',
  'Toliara',
  'Antsiranana'
];

const commonSpecialties = [
  'Sculpture sur bois',
  'Tissage traditionnel',
  'Poterie et céramique',
  'Bijouterie artisanale',
  'Vannerie',
  'Broderie',
  'Marqueterie',
  'Teinture naturelle',
  'Maroquinerie',
  'Ferronnerie'
];

export const ArtisanProfileEditor: React.FC<ArtisanProfileEditorProps> = ({
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    about: profile?.about || '',
    specialties: profile?.specialties || [''],
    location: {
      region: profile?.location.region || '',
      city: profile?.location.city || '',
      address: profile?.location.address || ''
    },
    experience: profile?.experience || '',
    artisanType: profile?.artisanType || 'artizaho' as const,
    businessInfo: {
      hasExistingBrand: profile?.businessInfo?.hasExistingBrand || false,
      currentSalesChannels: profile?.businessInfo?.currentSalesChannels || [''],
      workshopExperience: profile?.businessInfo?.workshopExperience || 'none' as const,
      businessDescription: profile?.businessInfo?.businessDescription || ''
    },
    certifications: profile?.certifications || [''],
    awards: profile?.awards || [''],
    socialMedia: {
      facebook: profile?.socialMedia?.facebook || '',
      instagram: profile?.socialMedia?.instagram || '',
      website: profile?.socialMedia?.website || ''
    }
  });

  const addArrayField = (field: 'specialties' | 'certifications' | 'awards') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'specialties' | 'certifications' | 'awards', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'specialties' | 'certifications' | 'awards', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.about || !formData.location.region || !formData.location.city || !formData.businessInfo.businessDescription) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const profileData = {
      ...formData,
      specialties: formData.specialties.filter(spec => spec.trim() !== ''),
      certifications: formData.certifications.filter(cert => cert.trim() !== ''),
      awards: formData.awards.filter(award => award.trim() !== ''),
      businessInfo: {
        ...formData.businessInfo,
        currentSalesChannels: formData.businessInfo.currentSalesChannels.filter(channel => channel.trim() !== '')
      },
      userId: 'current-user-id', // This would come from context
      memberSince: profile?.memberSince || new Date(),
      status: 'pending_approval' as const
    };

    onSaveProfile(profileData);
    
    toast({
      title: "Profil sauvegardé",
      description: "Votre profil a été sauvegardé et est en attente d'approbation"
    });
  };

  const getStatusBadge = (status?: ArtisanProfile['status']) => {
    if (!status) return null;
    
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      pending_approval: { label: 'En attente', variant: 'secondary' as const },
      published: { label: 'Publié', variant: 'default' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const }
    };
    return statusConfig[status];
  };

  const statusConfig = profile ? getStatusBadge(profile.status) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mon Profil Artisan</h2>
          <p className="text-gray-600">Gérez vos informations professionnelles</p>
        </div>
        {statusConfig && (
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        )}
      </div>

      {profile?.status === 'rejected' && profile.adminNotes && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-red-800 mb-2">Modifications demandées</h4>
            <p className="text-red-700 text-sm">{profile.adminNotes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Ces informations seront visibles sur votre profil public
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom / Nom de votre marque *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Hery Rakoto ou Malagasy Craft"
            />
          </div>

          <div>
            <Label htmlFor="about">À propos de vous *</Label>
            <Textarea
              id="about"
              value={formData.about}
              onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
              rows={4}
              placeholder="Parlez de votre parcours, votre passion pour l'artisanat..."
            />
          </div>

          <div>
            <Label htmlFor="experience">Expérience</Label>
            <Input
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              placeholder="Ex: 15 ans d'expérience en sculpture"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Type d'artisan et informations business</CardTitle>
          <CardDescription>
            Aidez-nous à mieux comprendre votre activité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Type d'artisan</Label>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.artisanType === 'artizaho' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, artisanType: 'artizaho' }))}
              >
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="radio" 
                    checked={formData.artisanType === 'artizaho'} 
                    onChange={() => setFormData(prev => ({ ...prev, artisanType: 'artizaho' }))}
                  />
                  <span className="font-medium text-blue-700">🔧 Artisan Artizaho</span>
                </div>
                <p className="text-sm text-gray-600">
                  Petit artisan vendant généralement en marque blanche sur Facebook/autres canaux. 
                  N'a jamais fait d'ateliers auparavant. Artizaho vous accompagne dans votre première expérience d'ateliers.
                </p>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.artisanType === 'uber' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, artisanType: 'uber' }))}
              >
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="radio" 
                    checked={formData.artisanType === 'uber'} 
                    onChange={() => setFormData(prev => ({ ...prev, artisanType: 'uber' }))}
                  />
                  <span className="font-medium text-purple-700">🏆 Artisan Uber</span>
                </div>
                <p className="text-sm text-gray-600">
                  Marque établie avec ses propres lignes de produits. 
                  Fait déjà des ateliers. Artizaho sera un nouveau canal de vente pour vous.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="business-description">Description de votre activité *</Label>
            <Textarea
              id="business-description"
              value={formData.businessInfo.businessDescription}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                businessInfo: { ...prev.businessInfo, businessDescription: e.target.value }
              }))}
              rows={3}
              placeholder="Décrivez votre activité actuelle, vos canaux de vente, votre expérience..."
            />
          </div>

          <div>
            <Label>Expérience avec les ateliers</Label>
            <div className="flex gap-4 mt-2">
              {[
                { value: 'none', label: 'Aucune expérience' },
                { value: 'beginner', label: 'Débutant' },
                { value: 'experienced', label: 'Expérimenté' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={option.value}
                    checked={formData.businessInfo.workshopExperience === option.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, workshopExperience: e.target.value as any }
                    }))}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>
              <input
                type="checkbox"
                checked={formData.businessInfo.hasExistingBrand}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  businessInfo: { ...prev.businessInfo, hasExistingBrand: e.target.checked }
                }))}
                className="mr-2"
              />
              J'ai déjà une marque établie
            </Label>
          </div>

          <div>
            <Label>Canaux de vente actuels</Label>
            {formData.businessInfo.currentSalesChannels.map((channel, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={channel}
                  onChange={(e) => {
                    const newChannels = [...formData.businessInfo.currentSalesChannels];
                    newChannels[index] = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, currentSalesChannels: newChannels }
                    }));
                  }}
                  placeholder="Ex: Facebook, Marché local, Boutique physique..."
                />
                {formData.businessInfo.currentSalesChannels.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newChannels = formData.businessInfo.currentSalesChannels.filter((_, i) => i !== index);
                      setFormData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, currentSalesChannels: newChannels }
                      }));
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  businessInfo: {
                    ...prev.businessInfo,
                    currentSalesChannels: [...prev.businessInfo.currentSalesChannels, '']
                  }
                }));
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un canal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spécialités</CardTitle>
          <CardDescription>
            Listez vos domaines d'expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formData.specialties.map((specialty, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={specialty}
                  onChange={(e) => updateArrayField('specialties', index, e.target.value)}
                  placeholder="Ex: Sculpture sur bois"
                  list="specialties-suggestions"
                />
                <datalist id="specialties-suggestions">
                  {commonSpecialties.map(spec => (
                    <option key={spec} value={spec} />
                  ))}
                </datalist>
                {formData.specialties.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayField('specialties', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayField('specialties')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une spécialité
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localisation</CardTitle>
          <CardDescription>
            Où se trouve votre atelier ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">Région *</Label>
              <Input
                id="region"
                value={formData.location.region}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, region: e.target.value }
                }))}
                placeholder="Ex: Antananarivo"
                list="regions-suggestions"
              />
              <datalist id="regions-suggestions">
                {madagascarRegions.map(region => (
                  <option key={region} value={region} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.location.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value }
                }))}
                placeholder="Ex: Antananarivo"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Adresse (optionnel)</Label>
            <Input
              id="address"
              value={formData.location.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, address: e.target.value }
              }))}
              placeholder="Adresse complète de l'atelier"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certifications et Récompenses</CardTitle>
          <CardDescription>
            Mettez en valeur vos certifications et prix
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Certifications</Label>
            {formData.certifications.map((certification, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={certification}
                  onChange={(e) => updateArrayField('certifications', index, e.target.value)}
                  placeholder="Ex: Certificat d'artisan d'art"
                />
                {formData.certifications.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayField('certifications', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayField('certifications')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une certification
            </Button>
          </div>

          <div>
            <Label>Récompenses et Prix</Label>
            {formData.awards.map((award, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={award}
                  onChange={(e) => updateArrayField('awards', index, e.target.value)}
                  placeholder="Ex: Prix du meilleur artisan 2023"
                />
                {formData.awards.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayField('awards', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayField('awards')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une récompense
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
          <CardDescription>
            Partagez vos liens de réseaux sociaux (optionnel)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={formData.socialMedia.facebook}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, facebook: e.target.value }
              }))}
              placeholder="https://facebook.com/votre-page"
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.socialMedia.instagram}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
              }))}
              placeholder="https://instagram.com/votre-compte"
            />
          </div>
          <div>
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              value={formData.socialMedia.website}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, website: e.target.value }
              }))}
              placeholder="https://votre-site-web.com"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder le profil
        </Button>
      </div>
    </div>
  );
};