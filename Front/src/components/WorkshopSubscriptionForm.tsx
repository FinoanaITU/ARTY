import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { Users, CreditCard, Calendar, MapPin, Clock, Star } from 'lucide-react';

const subscriptionRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  participants: z.number().min(1).max(50),
});

type SubscriptionRegistrationFormData = z.infer<typeof subscriptionRegistrationSchema>;

interface WorkshopSubscriptionFormProps {
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

const WorkshopSubscriptionForm = ({ workshop, onCancel }: WorkshopSubscriptionFormProps) => {
  const [participants, setParticipants] = useState(1);
  const { subscription, hasActiveSubscription, canUseCredits, useCredits } = useSubscription();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SubscriptionRegistrationFormData>({
    resolver: zodResolver(subscriptionRegistrationSchema),
    defaultValues: {
      participants: 1,
      fullName: user?.name || ''
    }
  });

  const watchedParticipants = watch('participants');

  React.useEffect(() => {
    setParticipants(watchedParticipants || 1);
  }, [watchedParticipants]);

  const creditsRequired = participants; // 1 crédit par participant

  const onSubmit = async (data: SubscriptionRegistrationFormData) => {
    if (!hasActiveSubscription) {
      toast({
        title: "Aucun abonnement actif",
        description: "Vous devez avoir un abonnement actif pour utiliser cette option",
        variant: "destructive"
      });
      return;
    }

    if (!canUseCredits(creditsRequired)) {
      toast({
        title: "Crédits insuffisants",
        description: `Vous avez besoin de ${creditsRequired} crédit(s) mais il vous en reste ${subscription?.creditsRemaining || 0}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const success = await useCredits(
        workshop.id,
        workshop.title,
        workshop.instructor,
        creditsRequired
      );

      if (success) {
        toast({
          title: "Inscription confirmée",
          description: `Vous êtes inscrit(e) à ${workshop.title}. ${creditsRequired} crédit(s) utilisé(s).`
        });
        onCancel(); // Fermer le formulaire
      } else {
        throw new Error("Échec de l'utilisation des crédits");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!hasActiveSubscription) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-brand-brown">
            Inscription avec abonnement
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              Vous n'avez pas d'abonnement actif pour utiliser cette option.
            </div>
            <Button onClick={onCancel} variant="outline">
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-brand-brown">
          Inscription avec abonnement - {workshop.title}
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
        {/* Statut de l'abonnement */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">{subscription?.planName}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Crédits disponibles</span>
                <span className="font-medium">{subscription?.creditsRemaining}/{subscription?.creditsTotal}</span>
              </div>
              <Progress 
                value={((subscription?.creditsTotal || 0) - (subscription?.creditsRemaining || 0)) / (subscription?.creditsTotal || 1) * 100} 
                className="h-2" 
              />
              <div className="text-xs text-muted-foreground">
                Expire le {subscription?.endDate.toLocaleDateString('fr-FR')}
              </div>
            </div>
          </CardContent>
        </Card>

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
                max={Math.min(workshop.maxParticipants, subscription?.creditsRemaining || 0)}
                {...register('participants', { valueAsNumber: true })}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setValue('participants', value);
                  setParticipants(value);
                }}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum {Math.min(workshop.maxParticipants, subscription?.creditsRemaining || 0)} participants (limité par vos crédits disponibles)
              </p>
              {errors.participants && (
                <p className="text-sm text-destructive mt-1">{errors.participants.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Récapitulatif des crédits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-brown">Utilisation des crédits</h3>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span>Crédits requis</span>
                <span className="font-medium">{creditsRequired}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Crédits disponibles</span>
                <span>{subscription?.creditsRemaining}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span>Crédits restants après inscription</span>
                <span className="font-bold text-brand-terracotta">
                  {(subscription?.creditsRemaining || 0) - creditsRequired}
                </span>
              </div>
            </div>

            {!canUseCredits(creditsRequired) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive text-sm">
                  ⚠️ Vous n'avez pas suffisamment de crédits pour cette inscription.
                </p>
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
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-brown hover:bg-brand-brown/90"
              disabled={!canUseCredits(creditsRequired) || isProcessing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? 'Inscription...' : 'Confirmer l\'inscription'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkshopSubscriptionForm;