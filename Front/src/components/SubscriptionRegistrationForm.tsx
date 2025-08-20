import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Star, Check } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';

const subscriptionRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  paymentMethod: z.enum(['card', 'mobile'], {
    required_error: 'Veuillez sélectionner un mode de paiement'
  }),
});

type SubscriptionRegistrationFormData = z.infer<typeof subscriptionRegistrationSchema>;

interface SubscriptionRegistrationFormProps {
  plan: SubscriptionPlan;
  onCancel: () => void;
}

const SubscriptionRegistrationForm = ({ plan, onCancel }: SubscriptionRegistrationFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createSubscription } = useSubscription();
  const { user } = useUser();
  const { addItem } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SubscriptionRegistrationFormData>({
    resolver: zodResolver(subscriptionRegistrationSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      paymentMethod: 'card'
    }
  });

  const watchedPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: SubscriptionRegistrationFormData) => {
    setIsProcessing(true);

    try {
      // Ajouter l'abonnement au panier pour le traitement du paiement
      addItem({
        type: 'subscription',
        subscriptionPlanId: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        quantity: 1,
        image: '/placeholder.svg', // Image par défaut pour les abonnements
        subscriptionDetails: {
          duration: plan.duration,
          credits: plan.credits,
          features: plan.features
        }
      });

      toast({
        title: "Ajouté au panier",
        description: `L'abonnement ${plan.name} a été ajouté à votre panier`
      });

      onCancel();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout au panier",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-brand-brown">
          Inscription - {plan.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">{plan.price.toLocaleString()} Ar</span>
          <span className="text-muted-foreground">/ {plan.duration}</span>
          {plan.recommended && (
            <Badge className="bg-primary text-primary-foreground">Recommandé</Badge>
          )}
        </div>
        <p className="text-muted-foreground">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Aperçu de l'abonnement */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Ce qui est inclus :</h3>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
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
          </div>

          <Separator />

          {/* Mode de paiement */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-brown">Mode de paiement</h3>
            
            <RadioGroup 
              value={watchedPaymentMethod} 
              onValueChange={(value) => setValue('paymentMethod', value as 'card' | 'mobile')}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Carte bancaire</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-primary rounded"></div>
                    <span>Paiement mobile</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Orange Money, Airtel Money, MVola</p>
                </Label>
              </div>
            </RadioGroup>
            
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          <Separator />

          {/* Récapitulatif */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-brown">Récapitulatif</h3>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span>Abonnement {plan.name}</span>
                <span className="font-medium">{plan.price.toLocaleString()} Ar</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Durée</span>
                <span>{plan.duration}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Crédits inclus</span>
                <span>{plan.credits} crédits</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-terracotta">{plan.price.toLocaleString()} Ar</span>
              </div>
            </div>
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
              disabled={isProcessing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? 'Traitement...' : 'Ajouter au panier'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubscriptionRegistrationForm;