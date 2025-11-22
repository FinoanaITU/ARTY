
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Star, Heart, ShoppingCart, ArrowLeft, Clock, Package, Truck, Lock, Ruler, Loader2 } from 'lucide-react';
import BulkOrderForm from '@/components/BulkOrderForm';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductReviews from '@/components/ProductReviews';
import SimilarProducts from '@/components/SimilarProducts';
import PriceVariationSelector from '@/components/PriceVariationSelector';
import WorkshopRecommendations from '@/components/WorkshopRecommendations';
import { PriceVariation } from '@/types/cart';
import apiService from '@/services/api';
import { toast } from 'sonner';
import type { ProductOut } from '@/types/product';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const { user, isLoggedIn } = useUser();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [selectedPriceVariation, setSelectedPriceVariation] = useState<PriceVariation | null>(null);

  // Charger le produit
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const productData = await apiService.getProduct(id);
        setProduct(productData);
        // Limiter la quantité au stock disponible
        if (productData.stock > 0) {
          setQuantity(Math.min(quantity, productData.stock));
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        if (error.response?.status === 404) {
          toast.error('Produit non trouvé');
        } else {
          toast.error('Erreur lors du chargement du produit');
        }
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
        <Navigation />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

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
      toast.error('Vous devez vous connecter pour ajouter des produits au panier !');
      navigate('/login');
      return;
    }
    
    if (product.stock === 0) {
      toast.error('Ce produit est en rupture de stock');
      return;
    }
    const q = Number(quantity) || 1;

    if (q > product.stock) {
      toast.error(`Quantité disponible: ${product.stock}`);
      setQuantity(product.stock);
      return;
    }

    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      artisan: product.artisan.name,
      price: selectedPriceVariation?.discountedPrice || product.price,
      quantity: q,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      priceVariation: selectedPriceVariation || undefined
    });
    
    toast.success('Produit ajouté au panier !');
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
              <ProductImageGallery 
                images={product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/600?text=Image+non+disponible']} 
                productName={product.name} 
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                  <span>{product.category}</span>
                  {product.subcategory && (
                    <>
                      <span>•</span>
                      <span>{product.subcategory}</span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.rating && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${
                            product.rating && i < Math.floor(product.rating) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {product.rating.toFixed(1)} ({product.review_count} avis)
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Prix de base pour les non-connectés */}
                {!isLoggedIn && (
                  <p className="text-2xl font-bold text-orange-600 mb-4">
                    À partir de {product.price.toLocaleString('fr-FR')} Ar
                  </p>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Temps de fabrication: {product.production_time_days} jour{product.production_time_days > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span>Stock: {product.stock} pièce{product.stock > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Expédition: 3-5 jours</span>
                </div>
                {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-purple-600" />
                    <span>
                      {product.dimensions.length && `${product.dimensions.length} cm`}
                      {product.dimensions.width && ` × ${product.dimensions.width} cm`}
                      {product.dimensions.height && ` × ${product.dimensions.height} cm`}
                      {product.dimensions.weight && ` (${product.dimensions.weight} kg)`}
                    </span>
                  </div>
                )}
              </div>

              {/* Materials */}
              {product.materials && product.materials.length > 0 && (
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
              )}

              {/* Available Colors */}
              {product.available_colors && product.available_colors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Couleurs disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.available_colors.map((color, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                        onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                      >
                        -
                      </Button>
                      <Input 
                        type="number" 
                        value={quantity as any} 
                        onFocus={() => { if (Number(quantity) === 1) setQuantity('' as any); }}
                        onChange={(e) => {
                          const v = e.target.value;
                          const val = v === '' ? '' as any : Math.max(1, Math.min(product.stock, parseInt(v) || 1));
                          setQuantity(val as any);
                        }}
                        onBlur={() => { if ((quantity as any) === '') setQuantity(1); }}
                        className="w-20 text-center"
                        min="1"
                        max={product.stock}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.stock, Number(quantity) + 1))}
                        disabled={Number(quantity) >= product.stock}
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
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
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

                {isLoggedIn && product.bulk_order_enabled && (
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => setShowBulkForm(true)}
                  >
                    Commande en gros {product.min_bulk_quantity && `(min. ${product.min_bulk_quantity} pièces)`}
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

          {/* Artisan Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>À propos de l'artisan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-semibold text-xl">
                  {product.artisan.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{product.artisan.name}</h3>
                  <Link to={`/artisan/${product.artisan.id}`}>
                    <Button variant="outline" size="sm" className="mt-2">
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
          {showBulkForm && product.bulk_order_enabled && (
            <BulkOrderForm 
              productId={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                minBulkQuantity: product.min_bulk_quantity || 5,
              }}
              onClose={() => setShowBulkForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
