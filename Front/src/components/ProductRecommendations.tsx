
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { useProductRecommendations } from '@/hooks/useRecommendations';
import { useCart } from '@/contexts/CartContext';

interface ProductRecommendationsProps {
  currentProductId: number;
  category: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  currentProductId,
  category
}) => {
  const { recommendations, loading } = useProductRecommendations(currentProductId, category);
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      artisan: product.artisan,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produits recommandés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Chargement des recommandations...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produits recommandés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-orange-100 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {product.rating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{product.artisan}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-600 text-sm">
                    {product.price.toLocaleString()} Ar
                  </span>
                  <div className="flex gap-1">
                    <Link to={`/product/${product.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        Voir
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="h-8 px-2 bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductRecommendations;
