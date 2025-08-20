import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { ArtisanProduct } from '@/types/artisan';
import { toast } from '@/hooks/use-toast';

interface ArtisanProductManagerProps {
  products: ArtisanProduct[];
  onCreateProduct: (product: Omit<ArtisanProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (id: string, product: Partial<ArtisanProduct>) => void;
  onDeleteProduct: (id: string) => void;
}

const productCategories = [
  'Sculptures',
  'Textiles',
  'Bijoux',
  'Poterie',
  'Vannerie',
  'Décoration',
  'Ustensiles',
  'Mobilier',
  'Autres'
];

export const ArtisanProductManager: React.FC<ArtisanProductManagerProps> = ({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ArtisanProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    images: [''],
    materials: [''],
    availableColors: [''],
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0
    },
    stock: 0,
    customizable: false,
    productionTime: 1
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      images: [''],
      materials: [''],
      availableColors: [''],
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0
      },
      stock: 0,
      customizable: false,
      productionTime: 1
    });
    setEditingProduct(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
      materials: formData.materials.filter(mat => mat.trim() !== ''),
      availableColors: formData.availableColors.filter(color => color.trim() !== ''),
      status: 'pending_approval' as const,
      artisanId: 'current-artisan-id' // This would come from context
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
      toast({
        title: "Produit modifié",
        description: "Votre produit a été modifié et est en attente d'approbation"
      });
    } else {
      onCreateProduct(productData);
      toast({
        title: "Produit créé",
        description: "Votre produit a été créé et est en attente d'approbation"
      });
    }

    resetForm();
    setIsCreateModalOpen(false);
  };

  const handleEdit = (product: ArtisanProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      images: product.images.length > 0 ? product.images : [''],
      materials: product.materials.length > 0 ? product.materials : [''],
      availableColors: product.availableColors?.length > 0 ? product.availableColors : [''],
      dimensions: product.dimensions || { length: 0, width: 0, height: 0, weight: 0 },
      stock: product.stock,
      customizable: product.customizable,
      productionTime: product.productionTime
    });
    setIsCreateModalOpen(true);
  };

  const addArrayField = (field: 'images' | 'materials' | 'availableColors') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'images' | 'materials' | 'availableColors', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'images' | 'materials' | 'availableColors', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: ArtisanProduct['status']) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      pending_approval: { label: 'En attente', variant: 'secondary' as const },
      published: { label: 'Publié', variant: 'default' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const }
    };
    return statusConfig[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Produits</h2>
          <p className="text-gray-600">Gérez vos produits artisanaux</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de votre produit
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Masque traditionnel"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Décrivez votre produit en détail"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Prix (Ar) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="productionTime">Délai (jours)</Label>
                  <Input
                    id="productionTime"
                    type="number"
                    min="1"
                    value={formData.productionTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, productionTime: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div>
                <Label>Images du produit</Label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={image}
                      onChange={(e) => updateArrayField('images', index, e.target.value)}
                      placeholder="URL de l'image"
                    />
                    {formData.images.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField('images', index)}
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
                  onClick={() => addArrayField('images')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une image
                </Button>
              </div>

              <div>
                <Label>Matériaux utilisés</Label>
                {formData.materials.map((material, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={material}
                      onChange={(e) => updateArrayField('materials', index, e.target.value)}
                      placeholder="Ex: Bois de palissandre"
                    />
                    {formData.materials.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField('materials', index)}
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
                  onClick={() => addArrayField('materials')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un matériau
                </Button>
              </div>

              <div>
                <Label>Coloris disponibles</Label>
                {formData.availableColors.map((color, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={color}
                      onChange={(e) => updateArrayField('availableColors', index, e.target.value)}
                      placeholder="Ex: Rouge bordeaux, Bleu marine"
                    />
                    {formData.availableColors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField('availableColors', index)}
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
                  onClick={() => addArrayField('availableColors')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un coloris
                </Button>
              </div>

              <div>
                <Label>Dimensions (optionnel)</Label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label htmlFor="length" className="text-xs">Longueur (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      min="0"
                      value={formData.dimensions.length}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs">Largeur (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">Hauteur (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      value={formData.dimensions.height}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-xs">Poids (g)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      value={formData.dimensions.weight}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, weight: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="customizable"
                  checked={formData.customizable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customizable: checked }))}
                />
                <Label htmlFor="customizable">Produit personnalisable</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
                {editingProduct ? 'Modifier' : 'Ajouter'} le produit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const statusConfig = getStatusBadge(product.status);
          return (
            <Card key={product.id}>
              <div className="aspect-square bg-gray-100 relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-orange-600">
                    {product.price.toLocaleString()} Ar
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {product.status === 'rejected' && product.adminNotes && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Raison du rejet:</strong> {product.adminNotes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};