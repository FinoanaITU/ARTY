
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import apiService from '@/services/api';
import type { ProductListItem } from '@/types/product';

interface SimilarProductsProps {
  currentProductId: string;
  category: string;
}

const SimilarProducts = ({ currentProductId, category }: SimilarProductsProps) => {
  const { language } = useLanguage();
  const [similarProducts, setSimilarProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSimilarProducts = async () => {
      setLoading(true);
      try {
        const response = await apiService.getSimilarProducts(currentProductId, 3);
        setSimilarProducts(response.items || []);
      } catch (error) {
        console.error('Error loading similar products:', error);
        // En cas d'erreur, on ne affiche pas de produits similaires
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      loadSimilarProducts();
    }
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Produits similaires</h2>
        <Link to="/products">
          <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
            Voir tout →
          </Button>
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {similarProducts.map((product) => (
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
              <CardDescription>par {product.artisan.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(product.price, language)}
                </span>
                {product.stock > 0 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    En stock
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    Rupture
                  </span>
                )}
              </div>
              <Link to={`/product/${product.id}`}>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Voir le produit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
