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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { Workshop, WorkshopFormData } from '@/types/workshop';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface WorkshopManagerProps {
  workshops: Workshop[];
  artisans: Array<{ id: string; name: string; specialty: string; }>;
  onCreateWorkshop: (workshop: WorkshopFormData) => void;
  onUpdateWorkshop: (id: string, workshop: WorkshopFormData) => void;
  onDeleteWorkshop: (id: string) => void;
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
  'Autres'
];

export const WorkshopManager: React.FC<WorkshopManagerProps> = ({
  workshops,
  artisans,
  onCreateWorkshop,
  onUpdateWorkshop,
  onDeleteWorkshop
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: '',
    category: '',
    artisanId: '',
    duration: 2,
    description: '',
    learningObjectives: [''],
    includedMaterials: [''],
    program: [''],
    importantInfo: [''],
    basePrice: 0,
    foreignPrice: 0,
    privatizationEnabled: false,
    maxParticipants: 12,
    type: 'inscription'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      artisanId: '',
      duration: 2,
      description: '',
      learningObjectives: [''],
      includedMaterials: [''],
      program: [''],
      importantInfo: [''],
      basePrice: 0,
      foreignPrice: 0,
      privatizationEnabled: false,
      maxParticipants: 12,
      type: 'inscription'
    });
    setSelectedDate(undefined);
    setEditingWorkshop(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const workshopData: WorkshopFormData = {
      ...formData,
      date: selectedDate,
      learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
      includedMaterials: formData.includedMaterials.filter(mat => mat.trim() !== ''),
      program: formData.program.filter(prog => prog.trim() !== ''),
      importantInfo: formData.importantInfo.filter(info => info.trim() !== '')
    };

    if (editingWorkshop) {
      onUpdateWorkshop(editingWorkshop.id, workshopData);
      toast({
        title: "Atelier modifié",
        description: "L'atelier a été modifié avec succès"
      });
    } else {
      onCreateWorkshop(workshopData);
      toast({
        title: "Atelier créé",
        description: "L'atelier a été créé avec succès"
      });
    }

    resetForm();
    setIsCreateModalOpen(false);
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      category: workshop.category,
      artisanId: workshop.artisan?.id || '',
      duration: workshop.duration,
      description: workshop.description,
      learningObjectives: workshop.learningObjectives.length > 0 ? workshop.learningObjectives : [''],
      includedMaterials: workshop.includedMaterials.length > 0 ? workshop.includedMaterials : [''],
      program: workshop.program.length > 0 ? workshop.program : [''],
      importantInfo: workshop.importantInfo.length > 0 ? workshop.importantInfo : [''],
      basePrice: workshop.basePrice,
      foreignPrice: workshop.foreignPrice || 0,
      privatizationEnabled: workshop.privatizationEnabled,
      privatizationOptions: workshop.privatizationOptions,
      maxParticipants: workshop.maxParticipants,
      type: workshop.type,
      location: workshop.location
    });
    setSelectedDate(workshop.date);
    setIsCreateModalOpen(true);
  };

  const addArrayField = (field: keyof Pick<WorkshopFormData, 'learningObjectives' | 'includedMaterials' | 'program' | 'importantInfo'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: keyof Pick<WorkshopFormData, 'learningObjectives' | 'includedMaterials' | 'program' | 'importantInfo'>, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: keyof Pick<WorkshopFormData, 'learningObjectives' | 'includedMaterials' | 'program' | 'importantInfo'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: Workshop['status']) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      published: { label: 'Publié', variant: 'default' as const },
      cancelled: { label: 'Annulé', variant: 'destructive' as const }
    };
    return statusConfig[status];
  };

  const getTypeBadge = (type: Workshop['type']) => {
    return type === 'inscription' ? 'Sur inscription' : 'Sur réservation';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Ateliers</h2>
          <p className="text-gray-600">Créez et gérez les ateliers de la plateforme</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un atelier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkshop ? 'Modifier l\'atelier' : 'Créer un nouvel atelier'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de l'atelier
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de l'atelier *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                  <Label htmlFor="type">Type d'atelier</Label>
                  <Select value={formData.type} onValueChange={(value: 'inscription' | 'reservation') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inscription">Sur inscription</SelectItem>
                      <SelectItem value="reservation">Sur réservation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'inscription' && (
                  <div>
                    <Label htmlFor="artisan">Artisan</Label>
                    <Select value={formData.artisanId} onValueChange={(value) => setFormData(prev => ({ ...prev, artisanId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un artisan" />
                      </SelectTrigger>
                      <SelectContent>
                        {artisans.map(artisan => (
                          <SelectItem key={artisan.id} value={artisan.id}>
                            {artisan.name} - {artisan.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.type === 'inscription' && (
                  <div>
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
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Durée (heures)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="8"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice">Prix local (Ar)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="foreignPrice">Prix étranger (Ar)</Label>
                    <Input
                      id="foreignPrice"
                      type="number"
                      min="0"
                      value={formData.foreignPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, foreignPrice: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="privatization"
                    checked={formData.privatizationEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privatizationEnabled: checked }))}
                  />
                  <Label htmlFor="privatization">Permettre la privatisation</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Description détaillée de l'atelier"
                  />
                </div>

                <div>
                  <Label>Ce que vous apprendrez</Label>
                  {formData.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={objective}
                        onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
                        placeholder="Objectif d'apprentissage"
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
                </div>

                <div>
                  <Label>Matériel inclus</Label>
                  {formData.includedMaterials.map((material, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={material}
                        onChange={(e) => updateArrayField('includedMaterials', index, e.target.value)}
                        placeholder="Matériel fourni"
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
                </div>

                <div>
                  <Label>Programme de l'atelier</Label>
                  {formData.program.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={step}
                        onChange={(e) => updateArrayField('program', index, e.target.value)}
                        placeholder="Étape du programme"
                      />
                      {formData.program.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayField('program', index)}
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
                    onClick={() => addArrayField('program')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une étape
                  </Button>
                </div>

                <div>
                  <Label>Informations importantes</Label>
                  {formData.importantInfo.map((info, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={info}
                        onChange={(e) => updateArrayField('importantInfo', index, e.target.value)}
                        placeholder="Information importante"
                      />
                      {formData.importantInfo.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayField('importantInfo', index)}
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
                    onClick={() => addArrayField('importantInfo')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une info
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
                {editingWorkshop ? 'Modifier' : 'Créer'} l'atelier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des ateliers</CardTitle>
          <CardDescription>
            {workshops.length} atelier{workshops.length > 1 ? 's' : ''} configuré{workshops.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Artisan</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshops.map((workshop) => {
                const statusConfig = getStatusBadge(workshop.status);
                return (
                  <TableRow key={workshop.id}>
                    <TableCell className="font-medium">{workshop.title}</TableCell>
                    <TableCell>{workshop.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeBadge(workshop.type)}</Badge>
                    </TableCell>
                    <TableCell>{workshop.artisan?.name || '-'}</TableCell>
                    <TableCell>
                      {workshop.date ? format(workshop.date, 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>{workshop.basePrice.toLocaleString()} Ar</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(workshop)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteWorkshop(workshop.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};