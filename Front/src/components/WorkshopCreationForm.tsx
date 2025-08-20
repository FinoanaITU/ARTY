import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calendar as CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WorkshopFormData {
  // Photos
  photos: string[];
  
  // Informations de base
  name: string;
  category: string;
  
  // Disponibilité
  availabilityTypes: {
    reservation: boolean;
    inscription: boolean;
    subscription: boolean;
  };
  
  // Aptitudes physiques
  physicalRequirements: string;
  
  // Localisation
  location: {
    artisanPlaceOnly: boolean;
    canRelocate: boolean;
    relocateDetails?: string;
  };
  
  // Horaires
  duration: number; // en heures
  date?: Date; // si inscription fixe
  
  // Tarification
  pricing: {
    basePrice: number;
    foreignPrice?: number;
  };
  
  // Descriptions
  description: string;
  schedule: string[]; // Déroulement
  learningObjectives: string[]; // Ce que vous apprendrez
  includedMaterials: string[]; // Matériel inclus
  
  // Informations importantes
  importantInfo: {
    minimumAge: number;
    requiredLevel: string;
    languages: string[];
    type: 'inscription_fixe' | 'reservation_libre';
    privatization: boolean;
    cancellationPolicy: string;
  };
}

interface WorkshopCreationFormProps {
  onSubmit: (data: WorkshopFormData) => void;
  onCancel: () => void;
  initialData?: Partial<WorkshopFormData>;
}

const categories = [
  'Sculpture sur bois',
  'Tissage traditionnel', 
  'Poterie et céramique',
  'Bijouterie artisanale',
  'Vannerie',
  'Broderie',
  'Marqueterie',
  'Cuisine malgache',
  'Teinture naturelle',
  'Instruments de musique',
  'Peinture traditionnelle',
  'Autres'
];

const languages = [
  'Français',
  'Malgache',
  'Anglais',
  'Allemand',
  'Italien'
];

const requiredLevels = [
  'Aucun',
  'Débutant',
  'Intermédiaire',
  'Avancé',
  'Expert'
];

export const WorkshopCreationForm: React.FC<WorkshopCreationFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<WorkshopFormData>({
    photos: [],
    name: '',
    category: '',
    availabilityTypes: {
      reservation: false,
      inscription: false,
      subscription: false
    },
    physicalRequirements: '',
    location: {
      artisanPlaceOnly: true,
      canRelocate: false
    },
    duration: 2,
    pricing: {
      basePrice: 0
    },
    description: '',
    schedule: [''],
    learningObjectives: [''],
    includedMaterials: [''],
    importantInfo: {
      minimumAge: 12,
      requiredLevel: 'Aucun',
      languages: ['Français'],
      type: 'inscription_fixe',
      privatization: false,
      cancellationPolicy: 'Annulation gratuite jusqu\'à 24h avant l\'atelier'
    },
    ...initialData
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.date);

  const handlePhotoUpload = () => {
    // Simulation d'upload de photo
    const newPhoto = `photo-${Date.now()}.jpg`;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
    toast({
      title: "Photo ajoutée",
      description: "La photo a été ajoutée avec succès"
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addArrayField = (field: 'schedule' | 'learningObjectives' | 'includedMaterials') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'schedule' | 'learningObjectives' | 'includedMaterials', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'schedule' | 'learningObjectives' | 'includedMaterials', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      importantInfo: {
        ...prev.importantInfo,
        languages: prev.importantInfo.languages.includes(language)
          ? prev.importantInfo.languages.filter(l => l !== language)
          : [...prev.importantInfo.languages, language]
      }
    }));
  };

  const handleSubmit = () => {
    // Validation de base
    if (!formData.name || !formData.category || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const hasAvailabilityType = Object.values(formData.availabilityTypes).some(Boolean);
    if (!hasAvailabilityType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un type de disponibilité",
        variant: "destructive"
      });
      return;
    }

    // Nettoyer les données
    const cleanedData = {
      ...formData,
      date: selectedDate,
      schedule: formData.schedule.filter(s => s.trim() !== ''),
      learningObjectives: formData.learningObjectives.filter(l => l.trim() !== ''),
      includedMaterials: formData.includedMaterials.filter(m => m.trim() !== '')
    };

    onSubmit(cleanedData);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouvel atelier</h1>
          <p className="text-gray-600 mt-2">Remplissez tous les détails de votre atelier</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
            Créer l'atelier
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Photos de l'atelier</CardTitle>
              <CardDescription>Ajoutez des photos pour illustrer votre atelier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">{photo}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={handlePhotoUpload} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Ajouter une photo
              </Button>
            </CardContent>
          </Card>

          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'atelier *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Initiation à la sculpture sur bois"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Décrivez votre atelier en détail..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Disponibilité */}
          <Card>
            <CardHeader>
              <CardTitle>Types de disponibilité</CardTitle>
              <CardDescription>Sélectionnez les modes de réservation disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reservation"
                  checked={formData.availabilityTypes.reservation}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    availabilityTypes: { ...prev.availabilityTypes, reservation: !!checked }
                  }))}
                />
                <Label htmlFor="reservation">Réservation libre</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inscription"
                  checked={formData.availabilityTypes.inscription}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    availabilityTypes: { ...prev.availabilityTypes, inscription: !!checked }
                  }))}
                />
                <Label htmlFor="inscription">Inscription à date fixe</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscription"
                  checked={formData.availabilityTypes.subscription}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    availabilityTypes: { ...prev.availabilityTypes, subscription: !!checked }
                  }))}
                />
                <Label htmlFor="subscription">Abonnement</Label>
              </div>

              {formData.availabilityTypes.inscription && (
                <div className="mt-4">
                  <Label>Date de l'atelier</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="artisanPlace"
                  checked={formData.location.artisanPlaceOnly}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, artisanPlaceOnly: !!checked }
                  }))}
                />
                <Label htmlFor="artisanPlace">Chez l'artisan uniquement</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canRelocate"
                  checked={formData.location.canRelocate}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, canRelocate: !!checked }
                  }))}
                />
                <Label htmlFor="canRelocate">Délocalisation possible</Label>
              </div>

              {formData.location.canRelocate && (
                <div>
                  <Label>Détails de délocalisation</Label>
                  <Textarea
                    value={formData.location.relocateDetails || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, relocateDetails: e.target.value }
                    }))}
                    placeholder="Conditions, zones possibles, surcoût..."
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Durée et tarification */}
          <Card>
            <CardHeader>
              <CardTitle>Durée et tarification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="duration">Durée (heures)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="12"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0.5 }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice">Prix local (Ar)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    value={formData.pricing.basePrice}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, basePrice: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="foreignPrice">Prix étranger (Ar)</Label>
                  <Input
                    id="foreignPrice"
                    type="number"
                    min="0"
                    value={formData.pricing.foreignPrice || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, foreignPrice: parseInt(e.target.value) || undefined }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aptitudes physiques */}
          <Card>
            <CardHeader>
              <CardTitle>Aptitudes physiques requises</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.physicalRequirements}
                onChange={(e) => setFormData(prev => ({ ...prev, physicalRequirements: e.target.value }))}
                placeholder="Décrivez les aptitudes physiques nécessaires (station debout, manipulation d'outils...)."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Déroulement */}
          <Card>
            <CardHeader>
              <CardTitle>Déroulement de l'atelier</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.schedule.map((step, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={step}
                    onChange={(e) => updateArrayField('schedule', index, e.target.value)}
                    placeholder={`Étape ${index + 1}`}
                  />
                  {formData.schedule.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('schedule', index)}
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
                onClick={() => addArrayField('schedule')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une étape
              </Button>
            </CardContent>
          </Card>

          {/* Ce que vous apprendrez */}
          <Card>
            <CardHeader>
              <CardTitle>Ce que vous apprendrez</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
                    placeholder={`Objectif ${index + 1}`}
                  />
                  {formData.learningObjectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('learningObjectives', index)}
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
                onClick={() => addArrayField('learningObjectives')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un objectif
              </Button>
            </CardContent>
          </Card>

          {/* Matériel inclus */}
          <Card>
            <CardHeader>
              <CardTitle>Matériel inclus</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.includedMaterials.map((material, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={material}
                    onChange={(e) => updateArrayField('includedMaterials', index, e.target.value)}
                    placeholder={`Matériel ${index + 1}`}
                  />
                  {formData.includedMaterials.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('includedMaterials', index)}
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
                onClick={() => addArrayField('includedMaterials')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter du matériel
              </Button>
            </CardContent>
          </Card>

          {/* Informations importantes */}
          <Card>
            <CardHeader>
              <CardTitle>Informations importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumAge">Âge minimum</Label>
                  <Input
                    id="minimumAge"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.importantInfo.minimumAge}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      importantInfo: { ...prev.importantInfo, minimumAge: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="requiredLevel">Niveau requis</Label>
                  <Select 
                    value={formData.importantInfo.requiredLevel} 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      importantInfo: { ...prev.importantInfo, requiredLevel: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requiredLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Langues proposées</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {languages.map(language => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={formData.importantInfo.languages.includes(language)}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <Label htmlFor={`lang-${language}`} className="text-sm">{language}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="type">Type d'atelier</Label>
                <Select 
                  value={formData.importantInfo.type} 
                  onValueChange={(value: 'inscription_fixe' | 'reservation_libre') => setFormData(prev => ({
                    ...prev,
                    importantInfo: { ...prev.importantInfo, type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inscription_fixe">Inscription fixe</SelectItem>
                    <SelectItem value="reservation_libre">Réservation libre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="privatization"
                  checked={formData.importantInfo.privatization}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    importantInfo: { ...prev.importantInfo, privatization: checked }
                  }))}
                />
                <Label htmlFor="privatization">Privatisation disponible</Label>
              </div>

              <div>
                <Label htmlFor="cancellationPolicy">Politique d'annulation</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={formData.importantInfo.cancellationPolicy}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    importantInfo: { ...prev.importantInfo, cancellationPolicy: e.target.value }
                  }))}
                  rows={2}
                  placeholder="Décrivez les conditions d'annulation..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};