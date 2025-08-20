import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditTracker } from '@/components/CreditTracker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Order, OrderUpdate } from '@/types/order';

const Dashboard = () => {
  const { user } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('orders');

  const updateOrderDates = (orderUpdate: OrderUpdate) => {
    setOrders(prev => prev.map(order => 
      order.id === orderUpdate.id 
        ? { ...order, ...orderUpdate }
        : order
    ));
    toast({
      title: "Dates mises à jour",
      description: "Les dates de la commande ont été modifiées avec succès"
    });
    setEditingOrder(null);
  };

  const getStatusLabel = (status: Order['status']) => {
    const statusMap = {
      delivered: 'Livré',
      shipped: 'Expédié', 
      pending: 'En attente',
      in_production: 'En production',
      ready_for_pickup: 'Prêt à récupérer'
    };
    return statusMap[status];
  };

  const getStatusColor = (status: Order['status']) => {
    const colorMap = {
      delivered: 'bg-green-100 text-green-700',
      shipped: 'bg-orange-100 text-orange-700',
      pending: 'bg-gray-100 text-gray-700',
      in_production: 'bg-blue-100 text-blue-700',
      ready_for_pickup: 'bg-purple-100 text-purple-700'
    };
    return colorMap[status];
  };

  const DatePicker = ({ date, onDateChange, placeholder }: { 
    date?: Date; 
    onDateChange: (date: Date | undefined) => void; 
    placeholder: string 
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-xs",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {date ? format(date, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'artisan') {
        navigate('/artisan-dashboard');
      }
      // For buyers, stay on this page
    }
  }, [user, navigate]);

  const [editingOrder, setEditingOrder] = React.useState<number | null>(null);
  const [orders, setOrders] = React.useState<Order[]>([
    {
      id: 1,
      date: '2024-05-25',
      artisan: 'Hery Rakoto',
      items: ['Masque traditionnel Vezo'],
      total: 45000,
      status: 'delivered',
      pickupDate: new Date('2024-06-01'),
      productionEndDate: new Date('2024-05-30')
    },
    {
      id: 2,
      date: '2024-05-20',
      artisan: 'Voahangy Razafy',
      items: ['Écharpe tissée', 'Sac traditionnel'],
      total: 65000,
      status: 'in_production',
      estimatedDeliveryDate: new Date('2024-06-15'),
      productionEndDate: new Date('2024-06-10')
    }
  ]);

  // Mock data for buyer
  const buyerData = {
    orders, // Use the state instead of static data
    workshops: [
      {
        id: 1,
        title: 'Initiation à la sculpture sur bois',
        date: '2024-06-15',
        instructor: 'Hery Rakoto',
        status: 'confirmed'
      }
    ],
    subscription: {
      id: 'sub-1',
      plan: 'premium' as const,
      status: 'active' as const,
      creditsIncluded: 100,
      creditsUsed: 35,
      renewalDate: new Date('2024-07-15')
    },
    creditTransactions: [
      {
        id: 'tx-1',
        type: 'earned' as const,
        amount: 20,
        description: 'Bonus de bienvenue',
        date: new Date('2024-05-01')
      },
      {
        id: 'tx-2',
        type: 'spent' as const,
        amount: 15,
        description: 'Atelier sculpture sur bois',
        date: new Date('2024-05-15'),
        relatedTo: 'Initiation à la sculpture sur bois'
      },
      {
        id: 'tx-3',
        type: 'spent' as const,
        amount: 10,
        description: 'Achat produit',
        date: new Date('2024-05-20'),
        relatedTo: 'Masque traditionnel Vezo'
      },
      {
        id: 'tx-4',
        type: 'earned' as const,
        amount: 5,
        description: 'Avis produit',
        date: new Date('2024-05-25'),
        relatedTo: 'Masque traditionnel Vezo'
      }
    ]
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
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate('/login')}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // This dashboard is now only for buyers
  if (user.role !== 'buyer') {
    return null; // Will be redirected by useEffect
  }

  const renderBuyerDashboard = () => {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="orders">{t('my_orders')}</TabsTrigger>
          <TabsTrigger value="workshops">{t('my_workshops')}</TabsTrigger>
          <TabsTrigger value="credits">Crédits Ateliers Abonnement</TabsTrigger>
        </TabsList>

      <TabsContent value="orders">
        <div className="space-y-4">
          {buyerData.orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Commande #{order.id}</h3>
                    <p className="text-sm text-gray-600">par {order.artisan}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOrder(editingOrder === order.id ? null : order.id)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1 mb-3">
                  {order.items.map((item, index) => (
                    <p key={index} className="text-sm text-gray-600">• {item}</p>
                  ))}
                </div>

                {editingOrder === order.id && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Date de récupération
                      </label>
                      <DatePicker
                        date={order.pickupDate}
                        onDateChange={(date) => updateOrderDates({ id: order.id, pickupDate: date })}
                        placeholder="Choisir une date"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Fin de production
                      </label>
                      <DatePicker
                        date={order.productionEndDate}
                        onDateChange={(date) => updateOrderDates({ id: order.id, productionEndDate: date })}
                        placeholder="Choisir une date"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Livraison estimée
                      </label>
                      <DatePicker
                        date={order.estimatedDeliveryDate}
                        onDateChange={(date) => updateOrderDates({ id: order.id, estimatedDeliveryDate: date })}
                        placeholder="Choisir une date"
                      />
                    </div>
                  </div>
                )}

                {/* Date information display */}
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  {order.pickupDate && (
                    <div className="flex justify-between">
                      <span>📅 Récupération:</span>
                      <span>{format(order.pickupDate, "dd/MM/yyyy")}</span>
                    </div>
                  )}
                  {order.productionEndDate && (
                    <div className="flex justify-between">
                      <span>🏭 Fin production:</span>
                      <span>{format(order.productionEndDate, "dd/MM/yyyy")}</span>
                    </div>
                  )}
                  {order.estimatedDeliveryDate && (
                    <div className="flex justify-between">
                      <span>🚚 Livraison estimée:</span>
                      <span>{format(order.estimatedDeliveryDate, "dd/MM/yyyy")}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Commandé le {new Date(order.date).toLocaleDateString('fr-FR')}
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

      <TabsContent value="credits">
        <CreditTracker 
          subscription={buyerData.subscription}
          transactions={buyerData.creditTransactions}
        />
      </TabsContent>
    </Tabs>
    );
  };

  // Remove artisan dashboard content - moved to ArtisanDashboard.tsx

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
              Gérez vos commandes et découvertes
            </p>
          </div>

          {/* Dashboard Content - Only for buyers */}
          {renderBuyerDashboard()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
