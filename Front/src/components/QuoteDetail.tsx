/**
 * QuoteDetail Component
 * Affiche les détails complets d'une demande de devis
 * Permet aux admins de mettre à jour le prix et les notes
 */
import { useState, useEffect } from 'react';
import { Quote, QuoteUpdateIn } from '@/types/quote';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface QuoteDetailProps {
  quoteId: string;
  onClose?: () => void;
  onUpdate?: (quote: Quote) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  quoted: 'Devis envoyé',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  completed: 'Complété',
};

export const QuoteDetail = ({ quoteId, onClose, onUpdate }: QuoteDetailProps) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState<QuoteUpdateIn>({
    final_price: undefined,
    admin_notes: undefined,
  });

  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getQuoteDetails(quoteId);
      setQuote(data);
      setEditData({
        final_price: data.final_price || undefined,
        admin_notes: data.admin_notes || undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuote = async () => {
    if (!quote) return;

    setUpdating(true);
    try {
      const updated = await apiService.updateQuote(quoteId, editData);
      await fetchQuoteDetails();
      onUpdate?.(quote);
      setIsEditing(false);
      toast.success('Devis mis à jour avec succès');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price?: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Chargement des détails...
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-6 bg-red-50 text-red-700">
        {error || 'Erreur lors du chargement du devis'}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quote.title}</h1>
          <p className="text-gray-600 max-w-2xl">{quote.description}</p>
        </div>

        <div className="text-right">
          <span className={`inline-block px-4 py-2 rounded-full font-medium ${STATUS_COLORS[quote.status]}`}>
            {STATUS_LABELS[quote.status]}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="block mt-4 text-gray-600 hover:text-gray-900"
            >
              ← Fermer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: Quote Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Informations du devis
          </h2>

          <div className="space-y-4 bg-gray-50 p-4 rounded">
            <div>
              <p className="text-sm text-gray-600">Type de devis</p>
              <p className="font-medium text-gray-900 capitalize">{quote.quote_type}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Quantité</p>
              <p className="font-medium text-gray-900">{quote.quantity}x</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Demandé le</p>
              <p className="font-medium text-gray-900">{formatDate(quote.requested_at)}</p>
            </div>

            {quote.estimated_price && (
              <div>
                <p className="text-sm text-gray-600">Prix estimé</p>
                <p className="font-medium text-gray-900">{formatPrice(quote.estimated_price)}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Cotation envoyée le</p>
              <p className="font-medium text-gray-900">{formatDate(quote.quoted_at)}</p>
            </div>

            {quote.responded_at && (
              <div>
                <p className="text-sm text-gray-600">Réponse du client le</p>
                <p className="font-medium text-gray-900">{formatDate(quote.responded_at)}</p>
              </div>
            )}

            {quote.completed_at && (
              <div>
                <p className="text-sm text-gray-600">Complété le</p>
                <p className="font-medium text-gray-900">{formatDate(quote.completed_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Client Info & Admin Section */}
        <div className="space-y-6">
          {/* Client Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Informations du client
            </h2>

            <div className="space-y-3 bg-gray-50 p-4 rounded">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-medium text-gray-900">{quote.client_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Type de client</p>
                <p className="font-medium text-gray-900 capitalize">
                  {quote.client_type}
                </p>
              </div>

              {quote.company_name && (
                <div>
                  <p className="text-sm text-gray-600">Entreprise</p>
                  <p className="font-medium text-gray-900">{quote.company_name}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a href={`mailto:${quote.client_email}`} className="font-medium text-blue-600 hover:text-blue-900">
                  {quote.client_email}
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <a href={`tel:${quote.client_phone}`} className="font-medium text-blue-600 hover:text-blue-900">
                  {quote.client_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Admin Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Gestion admin
            </h2>

            {isEditing ? (
              <div className="space-y-4 bg-blue-50 p-4 rounded border border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix final (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.final_price || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        final_price: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 150.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes admin
                  </label>
                  <textarea
                    value={editData.admin_notes || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        admin_notes: e.target.value || undefined,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes internes..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdateQuote}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {updating ? 'Mise à jour...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-gray-50 p-4 rounded">
                <div>
                  <p className="text-sm text-gray-600">Prix final</p>
                  <p className="font-medium text-gray-900 text-lg">
                    {formatPrice(quote.final_price)}
                  </p>
                </div>

                {quote.admin_notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap">
                      {quote.admin_notes}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  ✏️ Éditer prix/notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 pt-6 border-t space-y-3">
        <div className="flex gap-4">
          {quote.status === 'approved' && (
            <button
              onClick={async () => {
                try {
                  await apiService.convertQuoteToOrder(quoteId);
                  toast.success('Devis converti en commande');
                  await fetchQuoteDetails();
                } catch (err) {
                  toast.error('Erreur lors de la conversion');
                }
              }}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
            >
              → Convertir en commande
            </button>
          )}

          {quote.status === 'pending' && (
            <>
              <button
                onClick={async () => {
                  try {
                    await apiService.approveQuote(quoteId);
                    await fetchQuoteDetails();
                    toast.success('Devis approuvé avec succès');
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Erreur lors de l\'approbation';
                    toast.error(message);
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                ✓ Approuver
              </button>
              <button
                onClick={async () => {
                  try {
                    await apiService.rejectQuote(quoteId);
                    await fetchQuoteDetails();
                    toast.success('Devis rejeté avec succès');
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Erreur lors du rejet';
                    toast.error(message);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                ✗ Rejeter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
