
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight } from 'lucide-react';

const artisans = {
  'Hery Rakoto': {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    description: 'Maître sculpteur spécialisé dans l\'art traditionnel malgache depuis 20 ans.'
  },
  'Voahangy Razafy': {
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b332b302?w=50&h=50&fit=crop&crop=face',
    description: 'Tisseuse experte en lamba traditionnels et soie sauvage.'
  },
  'Nivo Andriamana': {
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
    description: 'Potier traditionnel utilisant des techniques ancestrales.'
  }
};

const categories = {
  'Sculpture et Bois': {
    subcategories: ['Masques traditionnels', 'Figurines', 'Objets décoratifs', 'Ustensiles'],
    products: [
      {
        id: 1,
        name: 'Masque traditionnel Vezo',
        artisan: 'Hery Rakoto',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop',
        rating: 4.8,
        subcategory: 'Masques traditionnels'
      },
      {
        id: 2,
        name: 'Statuette Zébu sacré',
        artisan: 'Hery Rakoto',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop',
        rating: 4.7,
        subcategory: 'Figurines'
      }
    ]
  },
  'Textile et Tissage': {
    subcategories: ['Lamba traditionnels', 'Vêtements', 'Accessoires', 'Décorations'],
    products: [
      {
        id: 3,
        name: 'Lamba Mena traditionnel',
        artisan: 'Voahangy Razafy',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=300&fit=crop',
        rating: 4.9,
        subcategory: 'Lamba traditionnels'
      },
      {
        id: 4,
        name: 'Châle en soie sauvage',
        artisan: 'Voahangy Razafy',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop',
        rating: 4.8,
        subcategory: 'Accessoires'
      }
    ]
  },
  'Poterie et Céramique': {
    subcategories: ['Vaisselle', 'Décorations', 'Sculptures', 'Ustensiles'],
    products: [
      {
        id: 5,
        name: 'Bol en terre cuite',
        artisan: 'Nivo Andriamana',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=300&fit=crop',
        rating: 4.6,
        subcategory: 'Vaisselle'
      }
    ]
  }
};

const Products = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Sculpture et Bois']);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getAllProducts = () => {
    return Object.values(categories).flatMap(cat => cat.products);
  };

  const filteredProducts = getAllProducts().filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.artisan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
    return matchesSearch && matchesSubcategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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
                {selectedSubcategory && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSubcategory('')}
                    className="mb-4 w-full text-orange-600"
                  >
                    Effacer les filtres
                  </Button>
                )}

                <div className="space-y-2">
                  {Object.entries(categories).map(([category, data]) => (
                    <div key={category}>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-orange-50 rounded-md transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        {expandedCategories.includes(category) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedCategories.includes(category) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {data.subcategories.map((subcategory) => (
                            <button
                              key={subcategory}
                              onClick={() => setSelectedSubcategory(
                                selectedSubcategory === subcategory ? '' : subcategory
                              )}
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
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                  {selectedSubcategory && ` dans "${selectedSubcategory}"`}
                </p>
              </div>

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-orange-100 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                        ⭐ {product.rating}
                      </div>
                      <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded-full text-xs">
                        {product.subcategory}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={artisans[product.artisan as keyof typeof artisans]?.photo}
                            alt={product.artisan}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-sm">{product.artisan}</div>
                            <div className="text-xs text-gray-500">
                              {artisans[product.artisan as keyof typeof artisans]?.description}
                            </div>
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-orange-600">
                          {product.price.toLocaleString()} Ar
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          En stock
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/product/${product.id}`} className="flex-1">
                          <Button className="w-full bg-orange-600 hover:bg-orange-700">
                            Acheter
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

              {/* No Results */}
              {filteredProducts.length === 0 && (
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
                      setSelectedSubcategory('');
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
