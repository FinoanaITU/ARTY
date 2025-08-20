import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Calendar, Users, MapPin, Euro } from 'lucide-react';

interface QuoteRequest {
  id: string;
  workshopTitle: string;
  instructor: string;
  requestedDate: Date;
  participants: number;
  location: string;
  status: 'pending' | 'quoted' | 'accepted' | 'confirmed';
  createdAt: Date;
  estimatedPrice?: number;
  finalPrice?: number;
  quoteDetails?: {
    basePrice: number;
    materialsCost: number;
    locationSurcharge: number;
    groupSizeAdjustment: number;
    finalPrice: number;
    validUntil: Date;
  };
}

interface QuoteStatusDisplayProps {
  quoteRequest: QuoteRequest;
  onAcceptQuote?: (quoteId: string) => void;
}

const QuoteStatusDisplay: React.FC<QuoteStatusDisplayProps> = ({
  quoteRequest,
  onAcceptQuote
}) => {
  const getStatusInfo = () => {
    switch (quoteRequest.status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          color: 'bg-orange-100 text-orange-800',
          title: 'Demande envoyée – Devis en cours',
          description: 'Votre demande a été transmise à l\'artisan. Vous recevrez un devis détaillé dans les 24-48h.'
        };
      case 'quoted':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: 'bg-blue-100 text-blue-800',
          title: 'Devis reçu – En attente de votre réponse',
          description: 'L\'artisan vous a envoyé un devis personnalisé. Consultez les détails ci-dessous.'
        };
      case 'accepted':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'bg-green-100 text-green-800',
          title: 'Devis accepté – Atelier confirmé',
          description: 'Parfait ! Votre atelier est confirmé. Vous recevrez bientôt les détails pratiques.'
        };
      default:
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'bg-green-100 text-green-800',
          title: 'Atelier confirmé',
          description: 'Tout est prêt pour votre atelier !'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{quoteRequest.workshopTitle}</CardTitle>
          <Badge className={statusInfo.color}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              <span className="text-xs">{statusInfo.title}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {statusInfo.description}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{quoteRequest.requestedDate.toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{quoteRequest.participants} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{quoteRequest.location}</span>
          </div>
          <div className="text-muted-foreground">
            Instructeur: {quoteRequest.instructor}
          </div>
        </div>

        {/* Quote Details */}
        {quoteRequest.status === 'quoted' && quoteRequest.quoteDetails && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-900">Devis détaillé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Prix de base</span>
                  <span>{quoteRequest.quoteDetails.basePrice.toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between">
                  <span>Matériel</span>
                  <span>{quoteRequest.quoteDetails.materialsCost.toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between">
                  <span>Déplacement</span>
                  <span>{quoteRequest.quoteDetails.locationSurcharge.toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between">
                  <span>Ajustement groupe ({quoteRequest.participants} pers.)</span>
                  <span>{quoteRequest.quoteDetails.groupSizeAdjustment.toLocaleString()} Ar</span>
                </div>
                <hr className="border-blue-300" />
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Total</span>
                  <span>{quoteRequest.quoteDetails.finalPrice.toLocaleString()} Ar</span>
                </div>
              </div>
              
              <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                Ce devis est valable jusqu'au {quoteRequest.quoteDetails.validUntil.toLocaleDateString('fr-FR')}
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => onAcceptQuote?.(quoteRequest.id)}
              >
                Accepter le devis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Estimated Price for Pending */}
        {quoteRequest.status === 'pending' && quoteRequest.estimatedPrice && (
          <div className="text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Euro className="h-4 w-4" />
              Prix estimé: {quoteRequest.estimatedPrice.toLocaleString()} Ar
            </span>
            <p className="text-xs mt-1">
              Le tarif affiché est une estimation. Un devis final sera envoyé selon votre lieu, la taille du groupe, le matériel et les contraintes logistiques.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteStatusDisplay;