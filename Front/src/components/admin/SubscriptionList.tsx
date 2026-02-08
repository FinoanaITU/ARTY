import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SubscriptionOut } from '@/types/admin';
import apiService from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Eye, Search, RefreshCw, Filter } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionListProps {
  onViewSubscription: (subscription: SubscriptionOut) => void;
  onRefresh: () => void;
}

/**
 * Liste paginée et filtrable des abonnements
 */
export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  onViewSubscription,
  onRefresh
}) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, [page, statusFilter, planFilter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubscriptionsList(
        statusFilter || undefined,
        planFilter || undefined,
        undefined,
        page * limit,
        limit
      );
      setSubscriptions(response.subscriptions);
      setTotal(response.total);
    } catch (err: any) {
      console.error('Erreur chargement subscriptions:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les abonnements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSubscriptions();
    onRefresh();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: 'default' as const, label: 'Actif', className: 'bg-green-500' },
      paused: { variant: 'secondary' as const, label: 'En pause', className: 'bg-orange-500' },
      cancelled: { variant: 'destructive' as const, label: 'Annulé', className: 'bg-red-500' },
      expired: { variant: 'secondary' as const, label: 'Expiré', className: 'bg-gray-500' },
      pending: { variant: 'secondary' as const, label: 'En attente', className: 'bg-blue-500' }
    };
    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, any> = {
      basic: { className: 'bg-gray-200 text-gray-800' },
      plus: { className: 'bg-blue-200 text-blue-800' },
      pro: { className: 'bg-purple-200 text-purple-800' },
      enterprise: { className: 'bg-orange-200 text-orange-800' }
    };
    const config = variants[plan] || variants.basic;
    return (
      <Badge className={config.className}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.user_name?.toLowerCase().includes(query) ||
      sub.user_email?.toLowerCase().includes(query) ||
      sub.id.toLowerCase().includes(query)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Liste des Abonnements</CardTitle>
            <CardDescription>
              {total} abonnement{total > 1 ? 's' : ''} au total
            </CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nom, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={statusFilter === '' ? 'all' : statusFilter} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan">Plan</Label>
            <Select value={planFilter === '' ? 'all' : planFilter} onValueChange={(val) => setPlanFilter(val === 'all' ? '' : val)}>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Tous les plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="plus">Plus</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('');
                setPlanFilter('');
                setSearchQuery('');
              }}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Prix/mois</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Chargement...</p>
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Aucun abonnement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.user_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{sub.user_email || sub.user_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{sub.available_credits.toFixed(0)}</p>
                        <p className="text-gray-500">/{sub.used_credits.toFixed(0)} utilisés</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(sub.monthly_price)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(sub.start_date), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(sub.end_date), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSubscription(sub)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && filteredSubscriptions.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Affichage {page * limit + 1} - {Math.min((page + 1) * limit, total)} sur {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * limit >= total}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
