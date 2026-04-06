import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X, Plus, Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type { WorkshopOut, WorkshopCreate } from '@/types/workshop';

interface WorkshopEditModalProps {
  workshop: WorkshopOut;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWorkshop: WorkshopOut) => void;
}

interface WorkshopFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  workshop_type: 'inscription' | 'reservation';
  skill_level: string;
  base_price: number;
  foreign_price?: number;
  min_participants: number;
  max_participants: number;
  duration_minutes: number;
  location: string;
  address: string;
  materials_included: string[];
  materials_to_bring: string[];
  prerequisites: string;
  what_you_will_learn: string[];
  tags: string[];
}

const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
  return url.startsWith('/') ? `${backendBase}${url}` : `${backendBase}/${url}`;
};

export const WorkshopEditModal: React.FC<WorkshopEditModalProps> = ({
  workshop,
  isOpen,
  onClose,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkshop, setIsLoadingWorkshop] = useState(false);
  const [workshopData, setWorkshopData] = useState<WorkshopOut | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  
  const titleRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const categoryRef = React.useRef<HTMLButtonElement>(null);
  const skillLevelRef = React.useRef<HTMLButtonElement>(null);
  const locationRef = React.useRef<HTMLInputElement>(null);
  const addressRef = React.useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: '',
    description: '',
    short_description: '',
    category: '',
    workshop_type: 'inscription',
    skill_level: '',
    base_price: 0,
    foreign_price: 0,
    min_participants: 1,
    max_participants: 10,
    duration_minutes: 120,
    location: '',
    address: '',
    materials_included: [],
    materials_to_bring: [],
    prerequisites: '',
    what_you_will_learn: [],
    tags: []
  });

  
  const [initialFormData, setInitialFormData] = useState<WorkshopFormData>(formData);

  
  useEffect(() => {
    const loadWorkshopData = async () => {
      if (workshop && isOpen) {
        setIsLoadingWorkshop(true);
        try {
          
          const fullWorkshopData = await apiService.getWorkshop(workshop.id);
          setWorkshopData(fullWorkshopData);

          const formDataFromWorkshop = {
            title: fullWorkshopData.title || '',
            description: fullWorkshopData.description || '',
            short_description: fullWorkshopData.short_description || '',
            category: fullWorkshopData.category || '',
            workshop_type: fullWorkshopData.workshop_type || 'inscription',
            skill_level: fullWorkshopData.skill_level || '',
            base_price: Number(fullWorkshopData.base_price) || 0,
            foreign_price: Number(fullWorkshopData.foreign_price) || 0,
            min_participants: fullWorkshopData.min_participants || 1,
            max_participants: fullWorkshopData.max_participants || 10,
            duration_minutes: fullWorkshopData.duration_minutes || 120,
            location: fullWorkshopData.location || '',
            address: fullWorkshopData.address || '',
            materials_included: fullWorkshopData.materials_included || [],
            materials_to_bring: fullWorkshopData.materials_to_bring || [],
            prerequisites: fullWorkshopData.prerequisites || '',
            what_you_will_learn: fullWorkshopData.what_you_will_learn || [],
            tags: fullWorkshopData.tags || []
          };
          
          setFormData(formDataFromWorkshop);
          setInitialFormData(formDataFromWorkshop);
          
          
          const existingPreviews: string[] = [];
          if (fullWorkshopData.featured_image_url) {
            existingPreviews.push(normalizeImageUrl(fullWorkshopData.featured_image_url));
          }
          if (fullWorkshopData.gallery_images) {
            existingPreviews.push(...fullWorkshopData.gallery_images.map(img => normalizeImageUrl(img)));
          }
          setPhotoPreviews(existingPreviews);
          setPhotos([]);
        } catch (error: any) {
          console.error('Erreur lors du chargement de l\'atelier:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données de l'atelier.",
            variant: "destructive",
          });
          onClose();
        } finally {
          setIsLoadingWorkshop(false);
        }
      }
    };

    loadWorkshopData();
  }, [workshop, isOpen, onClose]);

  const handleInputChange = (field: keyof WorkshopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: keyof WorkshopFormData, index: number, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: keyof WorkshopFormData) => {
    const currentArray = formData[field] as string[];
    setFormData(prev => ({ ...prev, [field]: [...currentArray, ''] }));
  };

  const removeArrayItem = (field: keyof WorkshopFormData, index: number) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = photos.length + files.length;

    if (totalPhotos > 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez ajouter que 5 photos maximum",
        variant: "destructive"
      });
      return;
    }

    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setPhotoPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  
  const validateAndFocus = (): boolean => {
    if (!formData.title?.trim()) {
      toast({
        title: "Champ requis",
        description: "Le titre de l'atelier est obligatoire.",
        variant: "destructive",
      });
      titleRef.current?.focus();
      titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!formData.description?.trim() || formData.description.length < 10) {
      toast({
        title: "Champ requis",
        description: "La description doit contenir au moins 10 caractères.",
        variant: "destructive",
      });
      descriptionRef.current?.focus();
      descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!formData.category?.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner une catégorie.",
        variant: "destructive",
      });
      categoryRef.current?.focus();
      categoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!formData.skill_level?.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un niveau.",
        variant: "destructive",
      });
      skillLevelRef.current?.focus();
      skillLevelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!formData.location?.trim()) {
      toast({
        title: "Champ requis",
        description: "Le lieu est obligatoire.",
        variant: "destructive",
      });
      locationRef.current?.focus();
      locationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!formData.address?.trim()) {
      toast({
        title: "Champ requis",
        description: "L'adresse est obligatoire.",
        variant: "destructive",
      });
      addressRef.current?.focus();
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    if (!hasChanges()) {
      toast({
        title: "Aucune modification",
        description: "Vous n'avez effectué aucune modification.",
        variant: "default",
      });
      return;
    }

    
    if (!validateAndFocus()) {
      return;
    }

    setIsLoading(true);

    try {

      
      const workshopData: any = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description || formData.description.substring(0, 200),
        category: formData.category,
        workshop_type: formData.workshop_type,
        skill_level: formData.skill_level,
        base_price: formData.base_price,
        foreign_price: formData.foreign_price || formData.base_price * 1.2,
        min_participants: formData.min_participants,
        max_participants: formData.max_participants,
        duration_minutes: formData.duration_minutes,
        location: formData.location,
        address: formData.address,
        materials_included: formData.materials_included?.filter(m => m.trim() !== ''),
        materials_to_bring: formData.materials_to_bring?.filter(m => m.trim() !== ''),
        prerequisites: formData.prerequisites,
        what_you_will_learn: formData.what_you_will_learn?.filter(w => w.trim() !== ''),
        tags: formData.tags?.filter(t => t.trim() !== ''),
      };

      
      const updatedWorkshop = await apiService.updateWorkshop(workshop.id, workshopData);

      toast({
        title: "Atelier mis à jour",
        description: "Les modifications ont été sauvegardées avec succès.",
      });

      onSave(updatedWorkshop);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'atelier:', error);
      let errorMessage = 'Erreur lors de la mise à jour';
      const errorDetail = error.response?.data?.detail;
      
      
      if (errorDetail && (errorDetail.includes('String should have at least 10 characters') || errorDetail.includes('description'))) {
        errorMessage = 'Description trop courte (minimum 10 caractères)';
        
        setTimeout(() => {
          descriptionRef.current?.focus();
          descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if (errorDetail) {
        errorMessage = errorDetail;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Modifier l'atelier</h2>
            <p className="text-gray-600">Modifiez les informations de votre atelier</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {isLoadingWorkshop ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mb-4" />
            <p className="text-gray-600">Chargement des données de l'atelier...</p>
          </div>
        ) : (
        <form key={workshop.id} onSubmit={handleSubmit} className="p-6 space-y-6">
          {}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Les informations principales de votre atelier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de l'atelier *</Label>
                <Input
                  ref={titleRef}
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Initiation à la poterie malgache"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description complète * (min. 10 caractères)</Label>
                <Textarea
                  ref={descriptionRef}
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez en détail votre atelier..."
                  className="min-h-[120px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} caractères
                </p>
              </div>

              <div>
                <Label htmlFor="short_description">Description courte</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Résumé de votre atelier (optionnel)"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger ref={categoryRef}>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poterie">Poterie</SelectItem>
                      <SelectItem value="Sculpture">Sculpture</SelectItem>
                      <SelectItem value="Textile">Textile</SelectItem>
                      <SelectItem value="Bijouterie">Bijouterie</SelectItem>
                      <SelectItem value="Peinture">Peinture</SelectItem>
                      <SelectItem value="Autres">Autres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="skill_level">Niveau *</Label>
                  <Select value={formData.skill_level} onValueChange={(value) => handleInputChange('skill_level', value)}>
                    <SelectTrigger ref={skillLevelRef}>
                      <SelectValue placeholder="Niveau requis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Débutant">Débutant</SelectItem>
                      <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="Avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workshop_type">Type d'atelier *</Label>
                  <Select value={formData.workshop_type} onValueChange={(value: 'inscription' | 'reservation') => handleInputChange('workshop_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inscription">Inscription</SelectItem>
                      <SelectItem value="reservation">Réservation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Prix et participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Prix de base (Ar) *</Label>
                  <Input
                    id="base_price"
                    type="number"
                    value={formData.base_price === 0 ? '' : formData.base_price}
                    onChange={(e) => handleInputChange('base_price', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    onBlur={(e) => { if (e.target.value === '') handleInputChange('base_price', 0); }}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="foreign_price">Prix étrangers (Ar)</Label>
                  <Input
                    id="foreign_price"
                    type="number"
                    value={formData.foreign_price || ''}
                    onChange={(e) => handleInputChange('foreign_price', e.target.value === '' ? undefined : parseInt(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min_participants">Min participants *</Label>
                  <Input
                    id="min_participants"
                    type="number"
                    value={formData.min_participants === 0 ? '' : formData.min_participants}
                    onChange={(e) => handleInputChange('min_participants', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    onBlur={(e) => { if (e.target.value === '') handleInputChange('min_participants', 1); }}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants">Max participants *</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants === 0 ? '' : formData.max_participants}
                    onChange={(e) => handleInputChange('max_participants', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    onBlur={(e) => { if (e.target.value === '') handleInputChange('max_participants', 10); }}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Durée (minutes) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes === 0 ? '' : formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    onBlur={(e) => { if (e.target.value === '') handleInputChange('duration_minutes', 120); }}
                    min="30"
                    step="30"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Lieu *</Label>
                <Input
                  ref={locationRef}
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Atelier de Marie, Antananarivo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse complète *</Label>
                <Input
                  ref={addressRef}
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Adresse détaillée"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Ce que les participants apprendront</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.what_you_will_learn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayInputChange('what_you_will_learn', index, e.target.value)}
                    placeholder={`Apprentissage ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('what_you_will_learn', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('what_you_will_learn')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un apprentissage
              </Button>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Matériel inclus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.materials_included.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayInputChange('materials_included', index, e.target.value)}
                    placeholder={`Matériel ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('materials_included', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('materials_included')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter du matériel inclus
              </Button>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Matériel à apporter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.materials_to_bring.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayInputChange('materials_to_bring', index, e.target.value)}
                    placeholder={`Matériel ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('materials_to_bring', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('materials_to_bring')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter du matériel à apporter
              </Button>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Prérequis</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.prerequisites}
                onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                placeholder="Ex: Aucun prérequis, débutants acceptés"
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Mots-clés pour aider à trouver votre atelier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.tags.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayInputChange('tags', index, e.target.value)}
                    placeholder={`Tag ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('tags', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('tags')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un tag
              </Button>
            </CardContent>
          </Card>

          {}
          {photoPreviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos actuelles</CardTitle>
                <CardDescription>Photos actuellement associées à l'atelier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 bg-orange-600">
                          Principale
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Pour modifier les photos, contactez l'administrateur ou recréez l'atelier.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !hasChanges()} 
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};