import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePriceVariations } from '@/hooks/usePriceVariations';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { Users, CreditCard, Calendar, MapPin, Clock } from 'lucide-react';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  participants: z.number().min(1).max(50),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface WorkshopRegistrationFormProps {
  workshop: {
    id: number;
    title: string;
    instructor: string;
    date?: string;
    time?: string;
    duration: string;
    price: number;
    location: string;
    maxParticipants: number;
    participants?: number;
    image: string;
  };
  onCancel: () => void;
}

const WorkshopRegistrationForm = ({ workshop, onCancel }: WorkshopRegistrationFormProps) => {
  const [participants, setParticipants] = useState(1);
  const { addItem } = useCart();
  const { user } = useUser();
  
  // Fonction pour déterminer le type d'utilisateur basé sur le profil
  const getUserType = () => {
    if (!user) return 'tourist';
    
    // Mapping des types du contexte utilisateur vers les types de prix
    if (user.buyerType === 'entreprise') {
      return 'business';
    }
    
    if (user.locationType === 'local') {
      return 'local';
    }
    
    // Par défaut, si c'est un particulier étranger
    return 'tourist';
  };

  const userType = getUserType();
  
  const {
    priceVariation,
    userTypeLabels,
    getFinalPrice
  } = usePriceVariations(workshop.price * participants, userType);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      participants: 1,
      fullName: user?.name || ''
    }
  });

  const watchedParticipants = watch('participants');

  React.useEffect(() => {
    setParticipants(watchedParticipants || 1);
  }, [watchedParticipants]);

  const onSubmit = (data: RegistrationFormData) => {
    // Ajouter au panier
    addItem({
      type: 'workshop',
      workshopId: workshop.id,
      name: workshop.title,
      artisan: workshop.instructor,
      price: workshop.price,
      quantity: data.participants,
      image: workshop.image,
      selectedDate: workshop.date ? new Date(workshop.date) : undefined,
      selectedTime: workshop.time,
      priceVariation: {
        type: userType,
        originalPrice: workshop.price * data.participants,
        discountedPrice: getFinalPrice(),
        discountPercentage: priceVariation.discountPercentage
      }
    });

    toast({
      title: "Ajouté au panier",
      description: `${workshop.title} a été ajouté à votre panier`
    });

    onCancel();
  };

  const totalOriginalPrice = workshop.price * participants;
  const totalFinalPrice = getFinalPrice();
  const totalSavings = totalOriginalPrice - totalFinalPrice;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-brand-brown">
          Inscription - {workshop.title}
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{workshop.date ? new Date(workshop.date).toLocaleDateString('fr-FR') : 'Date à définir'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{workshop.time || 'Horaire à définir'} - {workshop.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{workshop.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{workshop.participants || 0}/{workshop.maxParticipants} inscrits</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-brown">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Votre nom complet"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+261 XX XX XXX XX"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="participants">Nombre de participants *</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max={workshop.maxParticipants}
                {...register('participants', { valueAsNumber: true })}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setValue('participants', value);
                  setParticipants(value);
                }}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum {workshop.maxParticipants} participants
              </p>
              {errors.participants && (
                <p className="text-sm text-destructive mt-1">{errors.participants.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Affichage du type d'utilisateur automatique */}
          {user && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-brown">Profil de l'acheteur</h3>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{userTypeLabels[userType]}</span>
                  {userType !== 'tourist' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Tarif préférentiel appliqué
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Profil automatiquement détecté selon votre compte
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Récapitulatif des prix */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-brown">Récapitulatif</h3>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span>Prix unitaire</span>
                <span>{workshop.price.toLocaleString()} Ar</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Nombre de participants</span>
                <span>{participants}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Sous-total</span>
                <span className={totalSavings > 0 ? 'line-through text-muted-foreground' : ''}>
                  {totalOriginalPrice.toLocaleString()} Ar
                </span>
              </div>

              {totalSavings > 0 && (
                <>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Remise ({priceVariation.discountPercentage}%)</span>
                    <span>-{totalSavings.toLocaleString()} Ar</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total final</span>
                    <span className="text-brand-terracotta">{totalFinalPrice.toLocaleString()} Ar</span>
                  </div>
                </>
              )}

              {totalSavings === 0 && (
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand-terracotta">{totalFinalPrice.toLocaleString()} Ar</span>
                </div>
              )}
            </div>

            {totalSavings > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Économie de {totalSavings.toLocaleString()} Ar
                </Badge>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-brown hover:bg-brand-brown/90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ajouter au panier
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkshopRegistrationForm;