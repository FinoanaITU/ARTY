import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, X, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import type { ProductOut, CategoryOut } from '@/types/product';

interface ArtisanProductManagerProps {
  products: ProductOut[];
  onCreateProduct: (productData: any, photos?: File[]) => Promise<void>;
  onUpdateProduct: (id: string, productData: any, photos?: File[], deleteImageIds?: string[]) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const ArtisanProductManager: React.FC<ArtisanProductManagerProps> = ({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const { user } = useUser();

  
  const ImageGallery: React.FC<{ images: string[]; name?: string }> = ({ images, name }) => {
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
      if (!images || images.length === 0) {
        setIndex(0);
        return;
      }
      if (index >= images.length) setIndex(0);
    }, [images, index]);

    const mainSrc = images && images.length > 0 ? images[index] : '';

    return (
      <div className="aspect-square bg-gray-100 relative">
        {mainSrc ? (
          <img
            src={mainSrc}
            alt={name || 'Product image'}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+non+disponible'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {images && images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-2">
            {images.slice(0, 6).map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`rounded overflow-hidden border ${i === index ? 'ring-2 ring-orange-500' : ''}`}
                aria-label={`Afficher l'image ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  className="w-12 h-12 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=-'; }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  const [allProducts, setAllProducts] = useState<ProductOut[]>(products || []);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [pages, setPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductOut | null>(null);
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id?: string; url: string }>>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: 0,
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
    productionTime: 1,
    bulk_order_enabled: false,
    min_bulk_quantity: 0
  });

  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  
  const loadProducts = async (p: number = page, l: number = limit) => {
    try {
      setLoading(true);
      
      const params: any = { page: p, limit: l };
      if (user && (user.role === 'artisan' || user.role === 'admin')) params.artisan_id = user.id;
      const response = await apiService.getProducts(params);
      setAllProducts(response.items || []);
      setTotal(response.total || 0);
      setPages(response.pages || 1);
      setPage(response.page || p);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    loadProducts(1, limit);
    
    setAllProducts(products || []);
    
  }, []);

  
  const getSubcategories = () => {
    const category = categories.find(cat => cat.name === selectedCategory);
    return category?.subcategories || [];
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price: 0,
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
      productionTime: 1,
      bulk_order_enabled: false,
      min_bulk_quantity: 0
    });
    setEditingProduct(null);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setUploadedFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setDeletedImageIds([]);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !selectedCategory) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    
    const parsedPrice = (formData as any).price === '' ? 0 : Number((formData as any).price);
    const parsedStock = (formData as any).stock === '' ? 0 : Number((formData as any).stock);
    const parsedProductionTime = (formData as any).productionTime === '' ? 1 : Number((formData as any).productionTime);
    const parsedMinBulk = (formData as any).min_bulk_quantity === '' ? 0 : Number((formData as any).min_bulk_quantity);

    
    const parsedDimensions = {
      length: Number((formData.dimensions as any).length) || 0,
      width: Number((formData.dimensions as any).width) || 0,
      height: Number((formData.dimensions as any).height) || 0,
      weight: Number((formData.dimensions as any).weight) || 0
    };

    const productData = {
      ...formData,
      price: parsedPrice,
      stock: parsedStock,
      productionTime: parsedProductionTime,
      min_bulk_quantity: formData.bulk_order_enabled && parsedMinBulk > 0 ? parsedMinBulk : undefined,
      category: selectedCategory,
      subcategory: selectedSubcategory || undefined,
      materials: formData.materials.filter(mat => mat.trim() !== ''),
      availableColors: formData.availableColors.filter(color => color.trim() !== ''),
      dimensions: Object.values(parsedDimensions).some(v => v > 0) ? parsedDimensions : undefined
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(
          editingProduct.id,
          productData,
          uploadedFiles.length > 0 ? uploadedFiles : undefined,
          deletedImageIds.length > 0 ? deletedImageIds : undefined
        );
      } else {
        await onCreateProduct(productData, uploadedFiles.length > 0 ? uploadedFiles : undefined);
      }
      
      await loadProducts();
      resetForm();
      setIsCreateModalOpen(false);
    } catch (error) {
      
    }
  };

  const handleEdit = (product: ProductOut) => {
    setEditingProduct(product);
    setSelectedCategory(product.category);
    setSelectedSubcategory(product.subcategory || '');
    
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
    
    const normalizedImages: string[] = [];
    const existing: Array<{ id?: string; url: string }> = [];
    if ((product as any).image_items && Array.isArray((product as any).image_items)) {
      (product as any).image_items.forEach((it: any) => {
        if (!it) return;
        const imgUrl = it.url && it.url.startsWith('http') ? it.url : `${backendBase}${it.url.startsWith('/') ? '' : '/'}${it.url}`;
        normalizedImages.push(imgUrl);
        existing.push({ id: it.id, url: imgUrl });
      });
    } else {
      (product.images || []).forEach((img) => {
        if (!img) return;
        const imgUrl = img.startsWith('http') ? img : `${backendBase}${img.startsWith('/') ? '' : '/'}${img}`;
        normalizedImages.push(imgUrl);
        existing.push({ id: undefined, url: imgUrl });
      });
    }
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory || '',
      price: product.price,
      materials: (product.materials?.length > 0) ? product.materials : [''],
      availableColors: product.available_colors?.length > 0 ? product.available_colors : [''],
      dimensions: (product.dimensions as any) || { length: 0, width: 0, height: 0, weight: 0 },
      stock: product.stock,
      customizable: product.customizable || false,
      productionTime: product.production_time_days,
      bulk_order_enabled: product.bulk_order_enabled || false,
      min_bulk_quantity: product.min_bulk_quantity || 0
    });
    setImagePreviews([]); 
    setExistingImages(existing);
    setIsCreateModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedFiles.length > 10) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez pas télécharger plus de 10 images",
        variant: "destructive"
      });
      return;
    }
    setUploadedFiles(prev => [...prev, ...files]);
    
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addArrayField = (field: 'materials' | 'availableColors') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'materials' | 'availableColors', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'materials' | 'availableColors', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      draft: { label: 'Brouillon', variant: 'secondary' },
      pending_approval: { label: 'En attente', variant: 'secondary' },
      published: { label: 'Publié', variant: 'default' },
      rejected: { label: 'Rejeté', variant: 'destructive' }
    };
    return statusConfig[status] || { label: status, variant: 'secondary' as const };
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteProduct(id);
      await loadProducts(page, limit);
      toast({ title: 'Produit supprimé', description: 'Produit supprimé avec succès' });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      toast({ title: 'Erreur', description: err?.response?.data?.detail || 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (product: ProductOut) => {
    try {
      if (product.status === 'published') {
        await apiService.unpublishProduct(product.id);
        toast({
          title: 'Produit dépublié',
          description: 'Votre produit a été remis en brouillon'
        });
      } else {
        await apiService.publishProduct(product.id);
        toast({
          title: 'Produit publié',
          description: 'Votre produit est maintenant visible par tous'
        });
      }
      await loadProducts(page, limit);
    } catch (err: any) {
      console.error('Error toggling publish status:', err);
      toast({
        title: 'Erreur',
        description: err?.response?.data?.detail || 'Erreur lors de la modification du statut',
        variant: 'destructive'
      });
    }
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
                  <Select value={selectedCategory} onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedSubcategory(''); 
                    setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedCategory && getSubcategories().length > 0 && (
                <div>
                  <Label htmlFor="subcategory">Sous-catégorie (optionnel)</Label>
                  <Select value={selectedSubcategory} onValueChange={(value) => {
                    if (value === '__none') {
                      setSelectedSubcategory('');
                      setFormData(prev => ({ ...prev, subcategory: '' }));
                    } else {
                      setSelectedSubcategory(value);
                      setFormData(prev => ({ ...prev, subcategory: value }));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Aucune sous-catégorie</SelectItem>
                        {getSubcategories().map(subcategory => (
                          <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
              )}

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
                    onFocus={() => {
                      if (formData.price === 0) {
                        setFormData(prev => ({ ...prev, price: '' as any }));
                      }
                    }}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData(prev => ({ ...prev, price: v === '' ? '' as any : parseInt(v) }));
                    }}
                    onBlur={() => {
                      if ((formData as any).price === '') {
                        setFormData(prev => ({ ...prev, price: 0 }));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onFocus={() => {
                      if (formData.stock === 0) {
                        setFormData(prev => ({ ...prev, stock: '' as any }));
                      }
                    }}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData(prev => ({ ...prev, stock: v === '' ? '' as any : parseInt(v) }));
                    }}
                    onBlur={() => {
                      if ((formData as any).stock === '') {
                        setFormData(prev => ({ ...prev, stock: 0 }));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="productionTime">Délai (jours)</Label>
                  <Input
                    id="productionTime"
                    type="number"
                    min="1"
                    value={formData.productionTime}
                    onFocus={() => {
                      if (formData.productionTime === 0) {
                        setFormData(prev => ({ ...prev, productionTime: '' as any }));
                      }
                    }}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData(prev => ({ ...prev, productionTime: v === '' ? '' as any : parseInt(v) }));
                    }}
                    onBlur={() => {
                      if ((formData as any).productionTime === '') {
                        setFormData(prev => ({ ...prev, productionTime: 1 }));
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Images du produit (max 10)</Label>
                            <div className="mt-2">
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="mb-2"
                              />

                              {}
                              {existingImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {existingImages.map((img, index) => (
                                    <div key={`existing-${index}`} className="relative">
                                      <img
                                        src={img.url}
                                        alt={`Existing ${index + 1}`}
                                        className="w-full h-24 object-cover rounded border"
                                      />
                                      {img.id ? (
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-1 right-1 h-6 w-6 p-0"
                                          onClick={() => {
                                            
                                            if (img.id) {
                                              setDeletedImageIds(prev => [...prev, String(img.id)]);
                                            }
                                            setExistingImages(prev => prev.filter((_, i) => i !== index));
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {}
                              {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {imagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative">
                                      <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded border"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-1 right-1 h-6 w-6 p-0"
                                        onClick={() => {
                                          
                                          setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                          setImagePreviews(prev => prev.filter((_, i) => i !== index));
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {uploadedFiles.length === 0 && existingImages.length === 0 && imagePreviews.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Aucune image sélectionnée. Les images existantes seront conservées lors de la mise à jour.
                                </p>
                              )}
                            </div>
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
                      value={(formData as any).dimensions.length}
                      onFocus={() => {
                        if ((formData as any).dimensions.length === 0) {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, length: '' } as any }));
                        }
                      }}
                      onChange={(e) => setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, length: e.target.value } as any }))}
                      onBlur={() => {
                        if ((formData as any).dimensions.length === '') {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, length: 0 } as any }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs">Largeur (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      value={(formData as any).dimensions.width}
                      onFocus={() => {
                        if ((formData as any).dimensions.width === 0) {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, width: '' } as any }));
                        }
                      }}
                      onChange={(e) => setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, width: e.target.value } as any }))}
                      onBlur={() => {
                        if ((formData as any).dimensions.width === '') {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, width: 0 } as any }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">Hauteur (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      value={(formData as any).dimensions.height}
                      onFocus={() => {
                        if ((formData as any).dimensions.height === 0) {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, height: '' } as any }));
                        }
                      }}
                      onChange={(e) => setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, height: e.target.value } as any }))}
                      onBlur={() => {
                        if ((formData as any).dimensions.height === '') {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, height: 0 } as any }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-xs">Poids (g)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      value={(formData as any).dimensions.weight}
                      onFocus={() => {
                        if ((formData as any).dimensions.weight === 0) {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, weight: '' } as any }));
                        }
                      }}
                      onChange={(e) => setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, weight: e.target.value } as any }))}
                      onBlur={() => {
                        if ((formData as any).dimensions.weight === '') {
                          setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, weight: 0 } as any }));
                        }
                      }}
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

      {allProducts.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucun produit créé pour le moment</p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer votre premier produit
          </Button>
        </div>
      ) : (
        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProducts.map((product) => {
            const statusConfig = getStatusBadge(product.status);
            return (
              <Card key={product.id}>
                <div className="relative">
                  <ImageGallery images={product.images || []} name={product.name} />
                  <div className="absolute top-2 right-2">
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-orange-600">
                      {product.price.toLocaleString('fr-FR')} Ar
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
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
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {(product.status === 'draft' || product.status === 'published') && (
                      <Button
                        size="sm"
                        onClick={() => handleTogglePublish(product)}
                        className={product.status === 'published' ? 'bg-gray-600 hover:bg-gray-700 w-full' : 'bg-orange-600 hover:bg-orange-700 w-full'}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {product.status === 'published' ? 'Remettre en brouillon' : 'Publier'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { if (page > 1) loadProducts(page - 1, limit); }} disabled={page <= 1 || loading}>
              Précédent
            </Button>
            <Button variant="outline" size="sm" onClick={() => { if (page < pages) loadProducts(page + 1, limit); }} disabled={page >= pages || loading}>
              Suivant
            </Button>
            <span className="text-sm text-gray-600 ml-3">Page {page} / {pages} — {total} produits</span>
          </div>
          <div>
            <Label className="text-sm mr-2">Par page</Label>
            <select value={limit} onChange={(e) => { const l = Number(e.target.value); setLimit(l); loadProducts(1, l); }} className="border rounded px-2 py-1">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        </>
      )}
    </div>
  );
};