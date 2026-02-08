import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import apiService from '@/services/api';

const ArtisanProfile = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('products');
  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

    fetchArtisan();
  }, [id]);

  // Mock data pour les produits (à remplacer par un appel API)
  const products = [
    {
      id: 1,
      name: 'Masque traditionnel Vezo',
      price: 45000,
      image: '/placeholder.svg',
      inStock: true,
      description: 'Masque sculpté à la main selon les traditions Vezo'
    },
    {
      id: 2,
      name: 'Statuette Zébu',
      price: 25000,
      image: '/placeholder.svg',
      inStock: true,
      description: 'Magnifique statuette représentant un zébu sacré'
    },
    {
      id: 3,
      name: 'Bol en bois de palissandre',
      price: 35000,
      image: '/placeholder.svg',
      inStock: false,
      description: 'Bol artisanal en bois précieux de Madagascar'
    },
    {
      id: 4,
      name: 'Puzzle en bois',
      price: 15000,
      image: '/placeholder.svg',
      inStock: true,
      description: 'Puzzle éducatif en bois pour enfants'
    }
  ];

  const reviews = [
    {
      id: 1,
      user: 'Marie L.',
      rating: 5,
      date: '2024-05-20',
      comment: 'Magnifique travail ! La qualité est exceptionnelle et le service client parfait.'
    },
    {
      id: 2,
      user: 'Jean P.',
      rating: 5,
      date: '2024-05-15',
      comment: 'Très satisfait de mon achat. L\'artisan est très professionnel et talentueux.'
    },
    {
      id: 3,
      user: 'Sophie M.',
      rating: 4,
      date: '2024-05-10',
      comment: 'Belle pièce, livraison rapide. Je recommande vivement !'
    }
  ];

  const handleAddToCart = (product: any) => {
    if (!artisan) return;
    
    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      artisan: artisan.name,
      price: product.price,
      quantity: 1,
      image: product.image
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

  // Helper pour normaliser les URLs d'images
  const normalizeImageUrl = (url: string | undefined | null): string => {
    if (!url) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
    return url.startsWith('/') ? `${backendBase}${url}` : `${backendBase}/${url}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link to="/artisans" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
            ← Retour aux artisans
          </Link>

          {/* Artisan Header */}
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-orange-100 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-medium">Rupture de stock</span>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-orange-600">
                          {product.price.toLocaleString()} Ar
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.inStock 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.inStock ? 'En stock' : 'Épuisé'}
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
                          disabled={!product.inStock}
                          onClick={() => handleAddToCart(product)}
                        >
                          {product.inStock ? 'Panier' : 'Épuisé'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-3xl font-bold text-orange-600">{artisan.rating}</div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= Math.floor(artisan.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{artisan.reviewsCount} avis</p>
                    </div>
                  </div>
                </div>

                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.user}</h4>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfile;
