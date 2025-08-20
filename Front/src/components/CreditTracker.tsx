import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Clock, CheckCircle } from 'lucide-react';

interface CreditTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: Date;
  relatedTo?: string; // workshop title, product name, etc.
}

interface Subscription {
  id: string;
  plan: 'basic' | 'premium' | 'pro';
  status: 'active' | 'expired' | 'cancelled';
  creditsIncluded: number;
  creditsUsed: number;
  renewalDate: Date;
}

interface CreditTrackerProps {
  subscription: Subscription;
  transactions: CreditTransaction[];
}

export const CreditTracker: React.FC<CreditTrackerProps> = ({ subscription, transactions }) => {
  const creditsRemaining = subscription.creditsIncluded - subscription.creditsUsed;
  const usagePercentage = (subscription.creditsUsed / subscription.creditsIncluded) * 100;

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      case 'pro': return 'bg-gold-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mon abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getPlanColor(subscription.plan)}>
                  Plan {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </Badge>
                <Badge variant="outline" className={getStatusColor(subscription.status)}>
                  {subscription.status === 'active' ? 'Actif' : 
                   subscription.status === 'expired' ? 'Expiré' : 'Annulé'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Renouvellement le {subscription.renewalDate.toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {creditsRemaining}
              </div>
              <div className="text-sm text-gray-500">crédits restants</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilisation des crédits</span>
              <span>{subscription.creditsUsed}/{subscription.creditsIncluded}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Credit History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des crédits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune transaction pour le moment</p>
              </div>
            ) : (
              transactions
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {transaction.type === 'earned' ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        {transaction.relatedTo && (
                          <p className="text-xs text-gray-500">{transaction.relatedTo}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {transaction.date.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold text-sm ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} crédits
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};