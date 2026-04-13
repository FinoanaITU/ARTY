
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import apiService from '@/services/api';
import { toast } from 'sonner';
import type { ProductListItem, CategoryOut } from '@/types/product';

const Products = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response.categories || []);
        
        if (response.categories && response.categories.length > 0) {
          setExpandedCategories([response.categories[0].name]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Erreur lors du chargement des catégories');
      }
    };
    loadCategories();
  }, []);

  
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 20,
        };
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        
        if (selectedSubcategory) {
          params.subcategory = selectedSubcategory;
        }

        const response = await apiService.getProducts(params);
        setProducts(response.items || []);
        setTotal(response.total || 0);
        setTotalPages(response.pages || 1);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [searchTerm, selectedCategory, selectedSubcategory, page]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
    setSelectedSubcategory(''); 
    setPage(1); 
  };

  const handleSubcategoryClick = (parentCategory: string, subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory('');
    } else {
      setSelectedCategory(parentCategory);
      setSelectedSubcategory(subcategory);
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Catalogue de Produits
            </h1>
            <p className="text-gray-600">
              Découvrez l'artisanat authentique de Madagascar
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar with Categories Tree */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
                <h3 className="font-semibold text-gray-900 mb-4">Catégories</h3>
                
                {/* Clear filters */}
                {(selectedCategory || selectedSubcategory) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedSubcategory('');
                      setPage(1);
                    }}
                    className="mb-4 w-full text-orange-600"
                  >
                    Effacer les filtres
                  </Button>
                )}

                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.name}>
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-orange-50 rounded-md transition-colors"
                      >
                        <span 
                          className={`text-sm font-medium ${
                            selectedCategory === category.name 
                              ? 'text-orange-600' 
                              : 'text-gray-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryClick(category.name);
                          }}
                        >
                          {category.name}
                        </span>
                        {expandedCategories.includes(category.name) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedCategories.includes(category.name) && category.subcategories && category.subcategories.length > 0 && (
                        <div className="ml-4 mt-1 space-y-1">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory}
                              onClick={() => handleSubcategoryClick(category.name, subcategory)}
                              className={`block w-full text-left py-1 px-2 text-sm rounded transition-colors ${
                                selectedSubcategory === subcategory
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {subcategory}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search */}
              <div className="mb-6">
                <Input
                  type="text"
                  placeholder="Rechercher un produit ou artisan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  {loading ? (
                    <span>Chargement...</span>
                  ) : (
                    <>
                      {total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                      {selectedCategory && ` dans "${selectedCategory}"`}
                      {selectedSubcategory && ` > "${selectedSubcategory}"`}
                    </>
                  )}
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
              )}

              {/* Products Grid */}
              {!loading && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-orange-100 relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+non+disponible';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Pas d'image
                          </div>
                        )}
                        {product.rating != null && product.rating > 0 && (
                          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                            ⭐ {product.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-semibold text-xs">
                            {product.artisan.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-muted-foreground">{product.artisan.name}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-bold text-orange-600">
                            {formatCurrency(product.price, language)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/product/${product.id}`} className="flex-1">
                            <Button 
                              className="w-full bg-orange-600 hover:bg-orange-700"
                              disabled={product.stock === 0}
                            >
                              {product.stock > 0 ? 'Voir détails' : 'Indisponible'}
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            ♡
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}

              {/* No Results */}
              {!loading && products.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSelectedSubcategory('');
                      setPage(1);
                    }}
                    variant="outline"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
