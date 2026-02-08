/**
 * QuoteForm Component
 * Form pour créer une nouvelle demande de devis
 */
import { useState } from 'react';
import { QuoteRequestIn, QuoteType, ClientType } from '@/types/quote';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface QuoteFormProps {
  onSuccess?: (quoteId: string) => void;
  onCancel?: () => void;
}

const QUOTE_TYPES: { value: QuoteType; label: string }[] = [
  { value: 'workshop', label: 'Atelier' },
  { value: 'product', label: 'Produit' },
  { value: 'custom', label: 'Sur mesure' },
];

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: 'particulier', label: 'Particulier' },
  { value: 'entreprise', label: 'Entreprise' },
];

export const QuoteForm = ({ onSuccess, onCancel }: QuoteFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuoteRequestIn>({
    quote_type: 'custom',
    title: '',
    description: '',
    quantity: 1,
    client_type: 'particulier',
    client_name: '',
    client_email: '',
    client_phone: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation basique
      if (!formData.title.trim()) {
        throw new Error('Le titre est requis');
      }
      if (!formData.description.trim()) {
        throw new Error('La description est requise');
      }
      if (!formData.client_name.trim()) {
        throw new Error('Le nom du client est requis');
      }
      if (!formData.client_email.includes('@')) {
        throw new Error('Email invalide');
      }
      if (!formData.client_phone.trim()) {
        throw new Error('Le téléphone est requis');
      }

      const response = await apiService.createQuoteRequest(formData);
      
      if (response.id) {
        toast.success('Devis créé avec succès');
        onSuccess?.(response.id);
        // Reset form
        setFormData({
          quote_type: 'custom',
          title: '',
          description: '',
          quantity: 1,
          client_type: 'particulier',
          client_name: '',
          client_email: '',
          client_phone: '',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création du devis';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Créer une demande de devis</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de devis */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de devis *
            </label>
            <select
              name="quote_type"
              value={formData.quote_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QUOTE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre du devis *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Création de logo personnalisé"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez en détail votre projet..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Client info */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Informations du client</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de client *
              </label>
              <select
                name="client_type"
                value={formData.client_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CLIENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.client_type === 'entreprise' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleChange}
                  placeholder="Ex: Artizaho SARL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du client *
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Ex: Jean Dupont"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email du client *
              </label>
              <input
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                placeholder="client@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone du client *
            </label>
            <input
              type="tel"
              name="client_phone"
              value={formData.client_phone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 border-t pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Création en cours...' : 'Créer le devis'}
          </button>
        </div>
      </form>
    </div>
  );
};
