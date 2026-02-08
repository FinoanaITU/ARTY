/**
 * QuoteForm Component
 * Form pour créer une nouvelle demande de devis
 */
import { useState, useRef } from 'react';
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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const titleFieldRef = useRef<HTMLInputElement>(null);
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
    // Effacer l'erreur du champ spécifique
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Validation améliorée
      if (!formData.title.trim()) {
        const titleError = 'Le titre du devis est requis';
        setFieldErrors({ title: titleError });
        titleFieldRef.current?.focus();
        toast.error(titleError);
        setLoading(false);
        return;
      }

      if (formData.title.trim().length < 3) {
        const titleError = 'Le titre doit contenir au moins 3 caractères';
        setFieldErrors({ title: titleError });
        titleFieldRef.current?.focus();
        toast.error(titleError);
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        toast.error('La description est requise');
        setError('La description est requise');
        setLoading(false);
        return;
      }

      if (formData.description.trim().length < 10) {
        toast.error('La description doit contenir au moins 10 caractères');
        setError('La description doit contenir au moins 10 caractères');
        setLoading(false);
        return;
      }

      if (!formData.client_name.trim()) {
        toast.error('Le nom du client est requis');
        setLoading(false);
        return;
      }

      if (!formData.client_email.includes('@')) {
        toast.error('Veuillez entrer une adresse email valide');
        setLoading(false);
        return;
      }

      if (!formData.client_phone.trim()) {
        toast.error('Le téléphone du client est requis');
        setLoading(false);
        return;
      }

      const response = await apiService.createQuoteRequest(formData);
      
      if (response.id) {
        toast.success('Devis créé avec succès ! 🎉');
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
      let message = 'Erreur lors de la création du devis';
      let fieldErrorsMap: { [key: string]: string } = {};

      if (err instanceof Error) {
        // Vérifier si c'est une erreur de validation Pydantic
        if (err.message.includes('String should have at least')) {
          if (err.message.includes('title')) {
            const errorMsg = 'Le titre du devis doit contenir au moins 3 caractères';
            fieldErrorsMap['title'] = errorMsg;
            titleFieldRef.current?.focus();
            message = errorMsg;
          } else if (err.message.includes('description')) {
            message = 'La description doit contenir au moins 10 caractères';
          }
        } else if (err.message.includes('validation error')) {
          message = 'Veuillez vérifier tous les champs du formulaire';
        } else {
          message = err.message;
        }
      }

      setError(message);
      setFieldErrors(fieldErrorsMap);
      toast.error(message, {
        description: message.includes('3 caractères') 
          ? 'Vous avez actuellement ' + formData.title.length + ' caractère(s)'
          : undefined
      });
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
            Titre du devis * <span className="text-gray-500 text-xs">(min. 3 caractères)</span>
          </label>
          <input
            ref={titleFieldRef}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Création de logo personnalisé"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              fieldErrors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-sm text-red-600 font-medium">
              ⚠️ {fieldErrors.title}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.title.length} / 3 caractères minimum
          </p>
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
