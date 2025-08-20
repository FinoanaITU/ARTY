import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ArtisanProfile = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('products');

  // Mock data - in real app, fetch based on id
  const artisan = {
    id: 1,
    name: 'Hery Rakoto',
    specialty: 'Sculpture sur bois',
    location: 'Antananarivo',
    image: '/placeholder.svg',
    rating: 4.8,
    reviewsCount: 47,
    joinedDate: '2022-03-15',
    description: 'Artisan passionné depuis plus de 15 ans, je perpétue les traditions de sculpture sur bois malgache héritées de mes ancêtres. Chaque pièce que je crée raconte une histoire et porte en elle l\'âme de Madagascar.',
    specialties: ['Sculpture traditionnelle', 'Objets décoratifs', 'Figurines', 'Masques'],
    contact: {
      phone: '+261 34 12 345 67',
      email: 'hery.rakoto@artizaho.mg'
    }
  };

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
                  src={artisan.image}
                  alt={artisan.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{artisan.name}</h1>
                <p className="text-lg text-orange-600 mb-2">{artisan.specialty}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <span>📍 {artisan.location}</span>
                  <span>⭐ {artisan.rating} ({artisan.reviewsCount} avis)</span>
                  <span>📅 Depuis {new Date(artisan.joinedDate).getFullYear()}</span>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {artisan.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
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
                  {artisan.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Spécialités</h3>
                    <ul className="space-y-2">
                      {artisan.specialties.map((specialty, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                          {specialty}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>📍 {artisan.location}</p>
                      <p>⭐ {artisan.rating}/5 ({artisan.reviewsCount} avis)</p>
                      <p>📅 Membre depuis {new Date(artisan.joinedDate).getFullYear()}</p>
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
