import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import apiService from '@/services/api';

const ArtisanProfile = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('products');
  const [artisan, setArtisan] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtisan = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/v1/users/artisan/${id}`);
        
        if (!response.ok) {
          throw new Error('Artisan non trouvé');
        }
        
        const data = await response.json();
        setArtisan(data);
      } catch (err: any) {
        console.error('Erreur lors du chargement du profil artisan:', err);
        setError(err.message || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      if (!id) return;
      
      try {
        setProductsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const response = await fetch(`${apiUrl}/products?artisan_id=${id}&limit=50`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des produits');
        }
        
        const data = await response.json();
        setProducts(data.items || []);
      } catch (err: any) {
        console.error('Erreur lors du chargement des produits:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchArtisan();
    fetchProducts();
  }, [id]);

  
  const normalizeImageUrl = (url: string | undefined | null): string => {
    if (!url) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
    return url.startsWith('/') ? `${backendBase}${url}` : `${backendBase}/${url}`;
  };

  const handleAddToCart = (product: any) => {
    if (!artisan) return;
    
    const productImage = product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg';
    
    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      artisan: artisan.name,
      price: product.price,
      quantity: 1,
      image: productImage
    });
    alert('Produit ajouté au panier !');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-red-600 text-lg mb-4">{error || 'Artisan non trouvé'}</p>
          <Link to="/artisans">
            <Button variant="outline">Retour aux artisans</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {}
          <Link to="/artisans" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
            ← Retour aux artisans
          </Link>

          {}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 mx-auto md:mx-0 bg-orange-100 rounded-full overflow-hidden">
                <img
                  src={normalizeImageUrl(artisan.avatar)}
                  alt={artisan.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{artisan.name}</h1>
                <p className="text-lg text-orange-600 mb-2">
                  {artisan.artisan_profile?.main_specialty || artisan.artisan_profile?.company_name || 'Artisan'}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <span>📍 {artisan.artisan_profile?.region || artisan.city || 'Madagascar'}</span>
                  <span>📅 Depuis {artisan.created_at ? new Date(artisan.created_at).getFullYear() : 'N/A'}</span>
                </div>
                
                {artisan.artisan_profile?.other_skills && artisan.artisan_profile.other_skills.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    {artisan.artisan_profile.other_skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-center md:justify-start">
                  <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                    Suivre l'artisan
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="products">{t('products')}</TabsTrigger>
              <TabsTrigger value="about">{t('about')}</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">Aucun produit disponible pour le moment</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const inStock = product.stock > 0;
                    const productImage = product.images && product.images.length > 0 
                      ? product.images[0] 
                      : 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop';
                    
                    return (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-orange-100 relative">
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop';
                            }}
                          />
                          {!inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-medium">Rupture de stock</span>
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {product.description || 'Produit artisanal de qualité'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-bold text-orange-600">
                              {formatCurrency(product.price, language)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              inStock 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {inStock ? 'En stock' : 'Épuisé'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/product/${product.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                Voir détails
                              </Button>
                            </Link>
                            <Button 
                              className="bg-orange-600 hover:bg-orange-700"
                              disabled={!inStock}
                              onClick={() => handleAddToCart(product)}
                            >
                              {inStock ? 'Panier' : 'Épuisé'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">À propos de {artisan.name}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {artisan.artisan_profile?.about || 
                   artisan.artisan_profile?.activity_description || 
                   artisan.artisan_profile?.brand_story || 
                   'Artisan passionné perpétuant les traditions artisanales malgaches.'}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Spécialités</h3>
                    <ul className="space-y-2">
                      {artisan.artisan_profile?.main_specialty && (
                        <li className="flex items-center gap-2 text-gray-600">
                          <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                          {artisan.artisan_profile.main_specialty}
                        </li>
                      )}
                      {artisan.artisan_profile?.other_skills?.map((skill: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>📍 {artisan.artisan_profile?.region || artisan.city || 'Madagascar'}</p>
                      {artisan.artisan_profile?.years_experience && (
                        <p>⏱️ {artisan.artisan_profile.years_experience} d'expérience</p>
                      )}
                      {artisan.email && (
                        <p>✉️ {artisan.email}</p>
                      )}
                      {artisan.phone && (
                        <p>📞 {artisan.phone}</p>
                      )}
                      <p>📅 Membre depuis {artisan.created_at ? new Date(artisan.created_at).getFullYear() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Avis clients</h3>
                  <p className="text-gray-500">
                    Les avis seront bientôt disponibles. Revenez plus tard !
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfile;
