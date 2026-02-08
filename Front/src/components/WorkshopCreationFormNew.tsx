import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkshopCreate } from '@/types/workshop';
import apiService from '@/services/api';

interface WorkshopFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  workshop_type: 'inscription' | 'reservation';
  skill_level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  base_price: number;
  foreign_price?: number;
  max_participants: number;
  min_participants: number;
  duration_minutes: number;
  location: string;
  address?: string;
  materials_included?: string[];
  materials_to_bring?: string[];
  prerequisites?: string;
  what_you_will_learn?: string[];
  featured_image_url?: string;
  gallery_images?: string[];
  tags?: string[];
}

interface WorkshopCreationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Partial<WorkshopFormData>;
}

const categories = [
  'Sculpture',
  'Textile', 
  'Céramique',
  'Bijouterie',
  'Vannerie',
  'Broderie',
  'Marqueterie',
  'Cuisine',
  'Teinture',
  'Musique',
  'Peinture',
  'Autres'
];

const skillLevels = [
  'Débutant',
  'Intermédiaire',
  'Avancé'
];

const workshopTypes = [
  { value: 'inscription', label: 'Inscription (dates fixes)' },
  { value: 'reservation', label: 'Réservation (dates flexibles)' }
];

const WorkshopCreationForm: React.FC<WorkshopCreationFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: '',
    description: '',
    short_description: '',
    category: '',
    workshop_type: 'inscription',
    skill_level: 'Débutant',
    base_price: 0,
    foreign_price: 0,
    max_participants: 12,
    min_participants: 1,
    duration_minutes: 180, // 3 heures par défaut
    location: '',
    address: '',
    materials_included: [],
    materials_to_bring: [],
    prerequisites: '',
    what_you_will_learn: [],
    featured_image_url: '',
    gallery_images: [],
    tags: [],
    ...initialData
  });

  // Gestionnaires pour les listes dynamiques
  const addListItem = (field: keyof WorkshopFormData, value: string = '') => {
    const currentList = (formData[field] as string[]) || [];
    setFormData(prev => ({
      ...prev,
      [field]: [...currentList, value]
    }));
  };

  const updateListItem = (field: keyof WorkshopFormData, index: number, value: string) => {
    const currentList = (formData[field] as string[]) || [];
    const newList = [...currentList];
    newList[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newList
    }));
  };

  const removeListItem = (field: keyof WorkshopFormData, index: number) => {
    const currentList = (formData[field] as string[]) || [];
    const newList = currentList.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newList
    }));
  };

  // Gestionnaires pour les photos
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - photos.length); // Max 5 photos
    const newPhotos = [...photos, ...newFiles];
    setPhotos(newPhotos);

    // Créer les aperçus
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset l'input
    event.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (formData.base_price <= 0) {
      toast({
        title: "Erreur",
        description: "Le prix de base doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Préparer les données pour l'API
      const workshopData: WorkshopCreate = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description || formData.description.substring(0, 200),
        category: formData.category,
        workshop_type: formData.workshop_type,
        skill_level: formData.skill_level,
        base_price: formData.base_price,
        foreign_price: formData.foreign_price || formData.base_price * 1.2, // 20% de plus par défaut
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

      // Appel API avec photos
      const result = photos.length > 0 
        ? await apiService.createWorkshopWithPhotos(workshopData, photos, publishImmediately)
        : await apiService.createWorkshop(workshopData, publishImmediately);

      const statusMessage = publishImmediately 
        ? "Votre atelier a été créé et publié avec succès!"
        : "Votre atelier a été créé avec succès et est enregistré comme brouillon.";

      toast({
        title: "Atelier créé",
        description: statusMessage,
      });

      onSubmit(result);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'atelier:', error);
      
      let errorMessage = 'Erreur lors de la création de l\'atelier';
      const errorDetail = error.response?.data?.detail;
      
      // Gérer l'erreur de description trop courte
      if (errorDetail && (errorDetail.includes('String should have at least 10 characters') || errorDetail.includes('description'))) {
        errorMessage = 'Description trop courte (minimum 10 caractères)';
        // Mettre le focus sur le champ description
        setTimeout(() => {
          descriptionRef.current?.focus();
          descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if (errorDetail) {
        errorMessage = errorDetail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Créer un nouvel atelier</h2>
          <p className="text-gray-600">Partagez vos compétences et créez de nouvelles expériences</p>
        </div>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>Les informations principales de votre atelier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre de l'atelier *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Initiation à la sculpture sur bois"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="short_description">Description courte</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                placeholder="Une description courte pour les listes d'ateliers"
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="description">Description complète * (min. 10 caractères)</Label>
              <Textarea
                ref={descriptionRef}
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre atelier en détail..."
                className="min-h-32"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caractères
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos de l'atelier</CardTitle>
            <CardDescription>Ajoutez des photos pour illustrer votre atelier (max 5 photos)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Aperçu des photos */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-orange-600">
                          Photo principale
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload de photos */}
              {photos.length < 5 && (
                <div>
                  <Label htmlFor="photos">Ajouter des photos</Label>
                  <div className="mt-2">
                    <input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photos')?.click()}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Choisir des photos ({photos.length}/5)
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Formats acceptés: JPG, PNG, WebP. Taille max: 5MB par photo.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Type et niveau */}
        <Card>
          <CardHeader>
            <CardTitle>Type et niveau</CardTitle>
            <CardDescription>Définissez le type et le niveau de difficulté</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workshop_type">Type d'atelier *</Label>
                <Select
                  value={formData.workshop_type}
                  onValueChange={(value: 'inscription' | 'reservation') => setFormData(prev => ({ ...prev, workshop_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workshopTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skill_level">Niveau de difficulté *</Label>
                <Select
                  value={formData.skill_level}
                  onValueChange={(value: 'Débutant' | 'Intermédiaire' | 'Avancé') => setFormData(prev => ({ ...prev, skill_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logistique */}
        <Card>
          <CardHeader>
            <CardTitle>Logistique</CardTitle>
            <CardDescription>Durée, participants et lieu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration_minutes">Durée (minutes) *</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes === 0 ? '' : formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                  onBlur={(e) => { if (e.target.value === '') setFormData(prev => ({ ...prev, duration_minutes: 180 })); }}
                  placeholder="180"
                  min="30"
                  step="30"
                  required
                />
              </div>
              <div>
                <Label htmlFor="min_participants">Min participants *</Label>
                <Input
                  id="min_participants"
                  type="number"
                  value={formData.min_participants === 0 ? '' : formData.min_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_participants: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                  onBlur={(e) => { if (e.target.value === '') setFormData(prev => ({ ...prev, min_participants: 1 })); }}
                  placeholder="1"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                  onBlur={(e) => { if (e.target.value === '') setFormData(prev => ({ ...prev, max_participants: 12 })); }}
                  placeholder="12"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Lieu *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Atelier Rakoto, Antananarivo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adresse complète avec repères"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarification */}
        <Card>
          <CardHeader>
            <CardTitle>Tarification</CardTitle>
            <CardDescription>Prix par participant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Prix de base (Ar) *</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price === 0 ? '' : formData.base_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                  onBlur={(e) => { if (e.target.value === '') setFormData(prev => ({ ...prev, base_price: 0 })); }}
                  placeholder="25000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="foreign_price">Prix étranger (Ar)</Label>
                <Input
                  id="foreign_price"
                  type="number"
                  value={formData.foreign_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, foreign_price: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                  placeholder="30000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ce que les participants apprendront */}
        <Card>
          <CardHeader>
            <CardTitle>Ce que les participants apprendront</CardTitle>
            <CardDescription>Listez les compétences et connaissances acquises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(formData.what_you_will_learn || []).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('what_you_will_learn', index, e.target.value)}
                    placeholder="Ex: Les bases de la sculpture sur bois"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('what_you_will_learn', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('what_you_will_learn')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un objectif d'apprentissage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Matériel */}
        <Card>
          <CardHeader>
            <CardTitle>Matériel</CardTitle>
            <CardDescription>Listez le matériel fourni et celui à apporter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Matériel inclus</Label>
              <div className="space-y-2 mt-2">
                {(formData.materials_included || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateListItem('materials_included', index, e.target.value)}
                      placeholder="Ex: Bloc de bois de jacaranda"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem('materials_included', index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addListItem('materials_included')}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter du matériel inclus
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Matériel à apporter</Label>
              <div className="space-y-2 mt-2">
                {(formData.materials_to_bring || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateListItem('materials_to_bring', index, e.target.value)}
                      placeholder="Ex: Tablier de protection"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem('materials_to_bring', index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addListItem('materials_to_bring')}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter du matériel à apporter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prérequis */}
        <Card>
          <CardHeader>
            <CardTitle>Informations additionnelles</CardTitle>
            <CardDescription>Prérequis et autres informations importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="prerequisites">Prérequis</Label>
              <Textarea
                id="prerequisites"
                value={formData.prerequisites || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                placeholder="Ex: Aucun prérequis, débutants acceptés"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Option de publication */}
        <Card>
          <CardHeader>
            <CardTitle>Publication</CardTitle>
            <CardDescription>Choisissez si vous souhaitez publier l'atelier immédiatement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="publish"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="publish" className="text-sm font-normal cursor-pointer">
                Publier l'atelier immédiatement (visible par tous)
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {publishImmediately 
                ? "L'atelier sera visible publiquement après validation par l'équipe."
                : "L'atelier sera enregistré comme brouillon et ne sera pas visible avant publication."}
            </p>
          </CardContent>
        </Card>

        {/* Boutons de soumission */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {publishImmediately ? 'Créer et publier' : 'Créer l\'atelier'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkshopCreationForm;