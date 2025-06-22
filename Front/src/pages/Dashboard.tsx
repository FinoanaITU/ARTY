import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import ArtisanAvailabilityCalendar from '@/components/ArtisanAvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useUser();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('orders');

  // Mock data for different user roles
  const buyerData = {
    orders: [
      {
        id: 1,
        date: '2024-05-25',
        artisan: 'Hery Rakoto',
        items: ['Masque traditionnel Vezo'],
        total: 45000,
        status: 'delivered'
      },
      {
        id: 2,
        date: '2024-05-20',
        artisan: 'Voahangy Razafy',
        items: ['Écharpe tissée', 'Sac traditionnel'],
        total: 65000,
        status: 'shipped'
      }
    ],
    workshops: [
      {
        id: 1,
        title: 'Initiation à la sculpture sur bois',
        date: '2024-06-15',
        instructor: 'Hery Rakoto',
        status: 'confirmed'
      }
    ],
    wishlist: [
      {
        id: 1,
        name: 'Statuette Zébu',
        artisan: 'Hery Rakoto',
        price: 25000,
        image: '/placeholder.svg'
      },
      {
        id: 2,
        name: 'Collier en perles',
        artisan: 'Lalaina Ratsimbazafy',
        price: 18000,
        image: '/placeholder.svg'
      }
    ]
  };

  const artisanData = {
    stats: {
      totalSales: 450000,
      ordersThisMonth: 12,
      rating: 4.8,
      totalProducts: 24
    },
    recentOrders: [
      {
        id: 1,
        customer: 'Marie L.',
        items: ['Masque traditionnel'],
        total: 45000,
        date: '2024-05-25',
        status: 'delivered'
      },
      {
        id: 2,
        customer: 'Jean P.',
        items: ['Statuette Zébu'],
        total: 25000,
        date: '2024-05-23',
        status: 'shipped'
      }
    ],
    products: [
      {
        id: 1,
        name: 'Masque traditionnel Vezo',
        price: 45000,
        stock: 3,
        sales: 15,
        image: '/placeholder.svg'
      },
      {
        id: 2,
        name: 'Statuette Zébu',
        price: 25000,
        stock: 8,
        sales: 23,
        image: '/placeholder.svg'
      }
    ]
  };

  // Mock unavailability data for artisan
  const [artisanUnavailability, setArtisanUnavailability] = useState([
    {
      id: '1',
      startDate: new Date('2024-06-20'),
      endDate: new Date('2024-06-25'),
      reason: 'Vacances familiales',
      type: 'range' as const
    },
    {
      id: '2',
      startDate: new Date('2024-07-14'),
      reason: 'Formation professionnelle',
      type: 'single' as const
    }
  ]);

  const handleAvailabilitySave = (periods: any[]) => {
    setArtisanUnavailability(periods);
    toast({
      title: "Indisponibilités mises à jour",
      description: "Vos périodes d'indisponibilité ont été enregistrées avec succès.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connectez-vous pour accéder à votre tableau de bord
            </h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderBuyerDashboard = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="orders">{t('my_orders')}</TabsTrigger>
        <TabsTrigger value="workshops">{t('my_workshops')}</TabsTrigger>
        <TabsTrigger value="wishlist">{t('wishlist')}</TabsTrigger>
      </TabsList>

      <TabsContent value="orders">
        <div className="space-y-4">
          {buyerData.orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">Commande #{order.id}</h3>
                    <p className="text-sm text-gray-600">par {order.artisan}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'delivered' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {order.status === 'delivered' ? 'Livré' : 'Expédié'}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item, index) => (
                    <p key={index} className="text-sm text-gray-600">• {item}</p>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="font-semibold text-orange-600">
                    {order.total.toLocaleString()} Ar
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="workshops">
        <div className="space-y-4">
          {buyerData.workshops.map((workshop) => (
            <Card key={workshop.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{workshop.title}</h3>
                    <p className="text-sm text-gray-600">par {workshop.instructor}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Confirmé
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  📅 {new Date(workshop.date).toLocaleDateString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="wishlist">
        <div className="grid md:grid-cols-2 gap-4">
          {buyerData.wishlist.map((item) => (
            <Card key={item.id}>
              <div className="flex">
                <div className="w-20 h-20 bg-orange-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">par {item.artisan}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-orange-600">
                      {item.price.toLocaleString()} Ar
                    </span>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Acheter
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderArtisanDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {artisanData.stats.totalSales.toLocaleString()} Ar
            </div>
            <p className="text-sm text-gray-600">Ventes totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {artisanData.stats.ordersThisMonth}
            </div>
            <p className="text-sm text-gray-600">Commandes ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ⭐ {artisanData.stats.rating}
            </div>
            <p className="text-sm text-gray-600">Note moyenne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {artisanData.stats.totalProducts}
            </div>
            <p className="text-sm text-gray-600">Produits actifs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="products">Mes Produits</TabsTrigger>
          <TabsTrigger value="availability">Disponibilité</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="space-y-4">
            {artisanData.recentOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">Commande #{order.id}</h3>
                      <p className="text-sm text-gray-600">Client: {order.customer}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'delivered' ? 'Livré' : 'Expédié'}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">• {item}</p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="font-semibold text-orange-600">
                      {order.total.toLocaleString()} Ar
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Mes Produits</h2>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Ajouter un produit
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {artisanData.products.map((product) => (
                <Card key={product.id}>
                  <div className="flex">
                    <div className="w-20 h-20 bg-orange-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Prix: {product.price.toLocaleString()} Ar</p>
                        <p>Stock: {product.stock} unités</p>
                        <p>Ventes: {product.sales}</p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <ArtisanAvailabilityCalendar
            onSave={handleAvailabilitySave}
            initialUnavailablePeriods={artisanUnavailability}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Conseils pour améliorer vos ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">💡 Conseil du jour</h4>
                  <p className="text-green-700 text-sm">
                    Ajoutez plus de photos de vos produits pour augmenter les ventes de 40% !
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">📈 Tendance</h4>
                  <p className="text-blue-700 text-sm">
                    Les masques traditionnels sont très demandés cette semaine.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">🎯 Objectif</h4>
                  <p className="text-orange-700 text-sm">
                    Vous êtes à 2 ventes de votre objectif mensuel !
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour {user.name} !
            </h1>
            <p className="text-gray-600">
              {user.role === 'buyer' 
                ? 'Gérez vos commandes et découvertes' 
                : 'Gérez votre boutique et vos ventes'
              }
            </p>
          </div>

          {/* Dashboard Content */}
          {user.role === 'buyer' ? renderBuyerDashboard() : renderArtisanDashboard()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
