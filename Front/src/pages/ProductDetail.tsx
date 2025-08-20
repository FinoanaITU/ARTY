
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Star, Heart, ShoppingCart, ArrowLeft, Clock, Package, Truck, Lock, Ruler } from 'lucide-react';
import BulkOrderForm from '@/components/BulkOrderForm';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductReviews from '@/components/ProductReviews';
import SimilarProducts from '@/components/SimilarProducts';
import PriceVariationSelector from '@/components/PriceVariationSelector';
import WorkshopRecommendations from '@/components/WorkshopRecommendations';
import { PriceVariation } from '@/types/cart';

// Enhanced product data with all required fields
const getProductById = (id: string) => {
  const products = {
    '1': {
      id: 1,
      name: 'Masque traditionnel Vezo',
      artisan: 'Hery Rakoto',
      price: 45000,
      location: 'Antananarivo',
      images: [
        'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&h=600&fit=crop'
      ],
      category: 'Sculpture sur bois',
      subcategory: 'Masques traditionnels',
      rating: 4.8,
      reviewCount: 24,
      description: 'Masque traditionnel sculpté à la main selon les techniques ancestrales du peuple Vezo. Chaque détail raconte une histoire et représente les traditions maritimes de Madagascar.',
      materials: ['Bois de palissandre', 'Pigments naturels', 'Cire d\'abeille'],
      dimensions: {
        length: 25,
        width: 18,
        height: 8,
        weight: 0.6
      },
      craftingTime: '15 jours',
      stock: 3,
      bulkOrderEnabled: true,
      minBulkQuantity: 5,
      artisanInfo: {
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        description: 'Maître sculpteur spécialisé dans l\'art traditionnel malgache depuis 20 ans.',
        experience: '20 ans',
        specialties: ['Masques traditionnels', 'Sculptures animalières', 'Objets décoratifs']
      }
    },
    '2': {
      id: 2,
      name: 'Statuette Zébu sacré',
      artisan: 'Hery Rakoto',
      price: 25000,
      location: 'Antananarivo',
      images: [
        'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&h=600&fit=crop'
      ],
      category: 'Sculpture sur bois',
      subcategory: 'Figurines',
      rating: 4.7,
      reviewCount: 18,
      description: 'Représentation artistique du zébu, animal sacré de Madagascar.',
      materials: ['Bois d\'ébène', 'Huile de lin'],
      dimensions: {
        length: 15,
        width: 8,
        height: 12,
        weight: 0.3
      },
      craftingTime: '8 jours',
      stock: 7,
      bulkOrderEnabled: false,
      minBulkQuantity: 10,
      artisanInfo: {
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        description: 'Maître sculpteur spécialisé dans l\'art traditionnel malgache depuis 20 ans.',
        experience: '20 ans',
        specialties: ['Masques traditionnels', 'Sculptures animalières', 'Objets décoratifs']
      }
    }
  };
  return products[id as keyof typeof products] || null;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const { user, isLoggedIn } = useUser();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [selectedPriceVariation, setSelectedPriceVariation] = useState<PriceVariation | null>(null);

  const product = getProductById(id || '');

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
        <Navigation />
        <div className="px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <Link to="/products">
            <Button>Retour au catalogue</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      alert('Vous devez vous connecter pour ajouter des produits au panier !');
      return;
    }
    
    if (product) {
      addItem({
        type: 'product',
        productId: product.id,
        name: product.name,
        artisan: product.artisan,
        price: selectedPriceVariation?.discountedPrice || product.price,
        quantity,
        image: product.images[0],
        priceVariation: selectedPriceVariation || undefined
      });
      
      // Show success message
      alert('Produit ajouté au panier !');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-orange-600">Accueil</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-orange-600">Produits</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          {/* Back button */}
          <div className="mb-6">
            <Link to="/products">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au catalogue
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Product Images */}
            <div>
              <ProductImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                  <span>{product.category}</span>
                  <span>•</span>
                  <span>{product.subcategory}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {product.rating} ({product.reviewCount} avis)
                    </span>
                  </div>
                </div>
                
                {/* Prix de base pour les non-connectés */}
                {!isLoggedIn && (
                  <p className="text-2xl font-bold text-orange-600 mb-4">
                    À partir de {product.price.toLocaleString()} Ar
                  </p>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Temps de fabrication: {product.craftingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span>Stock: {product.stock} pièces</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Expédition: 3-5 jours</span>
                </div>
                {product.dimensions && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-purple-600" />
                    <span>
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm 
                      ({product.dimensions.weight} kg)
                    </span>
                  </div>
                )}
              </div>

              {/* Materials */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Matériaux utilisés</h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Variation Selector - Only for logged in users */}
              {isLoggedIn ? (
                <PriceVariationSelector
                  basePrice={product.price}
                  onPriceChange={setSelectedPriceVariation}
                />
              ) : (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-orange-700">
                      <Lock className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Connectez-vous pour voir vos tarifs personnalisés</p>
                        <p className="text-sm">Les prix varient selon votre profil (particulier, entreprise, résident local)</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to="/login">
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Se connecter
                        </Button>
                      </Link>
                      <Link to="/signup">
                        <Button variant="outline" size="sm">
                          Créer un compte
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quantity and Actions */}
              <div className="space-y-4">
                {isLoggedIn && (
                  <div className="flex items-center gap-4">
                    <label className="font-medium">Quantité:</label>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <Input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                        min="1"
                        max={product.stock}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {isLoggedIn ? (
                    <>
                      <Button 
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={isFavorite ? 'text-red-600 border-red-600' : ''}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                    </>
                  ) : (
                    <div className="flex-1">
                      <Button 
                        className="w-full bg-gray-400 cursor-not-allowed"
                        disabled
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Connectez-vous pour acheter
                      </Button>
                    </div>
                  )}
                </div>

                {isLoggedIn && product.bulkOrderEnabled && (
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => setShowBulkForm(true)}
                  >
                    Commande en gros (min. {product.minBulkQuantity} pièces)
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Product Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>

          {/* Artisan Info - UPDATED to remove contact option */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>À propos de l'artisan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <img 
                  src={product.artisanInfo.photo} 
                  alt={product.artisan}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{product.artisan}</h3>
                  <p className="text-gray-600 mb-3">{product.artisanInfo.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.artisanInfo.specialties.map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <Link to={`/artisan/${product.artisan.toLowerCase().replace(' ', '-')}`}>
                    <Button variant="outline" size="sm">
                      Voir le profil complet
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workshop Recommendations */}
          <div className="mb-8">
            <WorkshopRecommendations category={product.category} />
          </div>

          {/* Reviews */}
          <ProductReviews productId={product.id} />

          {/* Similar Products */}
          <SimilarProducts currentProductId={product.id} category={product.category} />

          {/* Bulk Order Form Modal */}
          {showBulkForm && (
            <BulkOrderForm 
              product={product}
              onClose={() => setShowBulkForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
