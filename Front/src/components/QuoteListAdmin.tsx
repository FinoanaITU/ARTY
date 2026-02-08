/**
 * QuoteListAdmin Component
 * Affiche la liste des devis (pour les admins)
 */
import { useState, useEffect } from 'react';
import { Quote, QuoteStatus, QuoteListResponse } from '@/types/quote';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface QuoteListAdminProps {
  onSelectQuote?: (quote: Quote) => void;
  refreshTrigger?: number;
}

const STATUS_COLORS: Record<QuoteStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  pending: 'En attente',
  quoted: 'Devis envoyé',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  completed: 'Complété',
};

export const QuoteListAdmin = ({ onSelectQuote, refreshTrigger }: QuoteListAdminProps) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: QuoteListResponse = await apiService.getAllQuotes(
        filterStatus || undefined,
        undefined,
        skip,
        limit
      );
      setQuotes(response.items);
      setTotal(response.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des devis';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSkip(0);
    fetchQuotes();
  }, [filterStatus, refreshTrigger]);

  useEffect(() => {
    if (skip > 0) {
      fetchQuotes();
    }
  }, [skip]);

  const handleApproveClick = async (quoteId: string) => {
    try {
      await apiService.approveQuote(quoteId);
      toast.success('Devis approuvé avec succès');
      fetchQuotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'approbation';
      toast.error(message);
    }
  };

  const handleRejectClick = async (quoteId: string) => {
    try {
      await apiService.rejectQuote(quoteId);
      toast.success('Devis rejeté avec succès');
      fetchQuotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du rejet';
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price?: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header avec filtres */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Demandes de devis</h2>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="quoted">Devis envoyé</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
              <option value="completed">Complété</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 self-end pb-2">
            {total} devis au total
          </div>
        </div>
      </div>

      {/* Liste des devis */}
      <div className="overflow-x-auto">
        {loading && !quotes.length ? (
          <div className="p-6 text-center text-gray-500">
            Chargement des devis...
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700">
            {error}
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun devis trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Demandé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{quote.title}</div>
                    <div className="text-sm text-gray-500">{quote.quote_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{quote.client_name}</div>
                    <div className="text-sm text-gray-500">{quote.client_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {quote.quantity}x
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(quote.requested_at)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatPrice(quote.final_price || quote.estimated_price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[quote.status]}`}>
                      {STATUS_LABELS[quote.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectQuote?.(quote)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Détails
                      </button>

                      {quote.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveClick(quote.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleRejectClick(quote.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rejeter
                          </button>
                        </>
                      )}

                      {quote.status === 'approved' && (
                        <button
                          onClick={() => apiService.convertQuoteToOrder(quote.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          → Commande
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            ← Précédent
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            onClick={() => setSkip(skip + limit)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
};
