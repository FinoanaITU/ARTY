
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SimilarProduct {
  id: number;
  name: string;
  artisan: string;
  price: number;
  image: string;
  rating: number;
  category: string;
}

interface SimilarProductsProps {
  currentProductId: number;
  category: string;
}

const SimilarProducts = ({ currentProductId, category }: SimilarProductsProps) => {
  // Mock similar products data - in a real app, this would come from an API
  const allProducts: SimilarProduct[] = [
    {
      id: 2,
      name: 'Statuette Zébu sacré',
      artisan: 'Hery Rakoto',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop',
      rating: 4.7,
      category: 'Sculpture sur bois'
    },
    {
      id: 4,
      name: 'Masque Sakalava',
      artisan: 'Rabe Andriana',
      price: 38000,
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop',
      rating: 4.6,
      category: 'Sculpture sur bois'
    },
    {
      id: 5,
      name: 'Sculpture Animalière',
      artisan: 'Hery Rakoto',
      price: 32000,
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop',
      rating: 4.8,
      category: 'Sculpture sur bois'
    }
  ];

  const similarProducts = allProducts.filter(
    product => product.category === category && product.id !== currentProductId
  ).slice(0, 3);

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
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                ⭐ {product.rating}
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>par {product.artisan}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-orange-600">
                  {product.price.toLocaleString()} Ar
                </span>
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
