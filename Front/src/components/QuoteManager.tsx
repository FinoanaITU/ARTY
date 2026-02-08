/**
 * QuoteManager Component
 * Composant principal pour gérer les demandes de devis
 * Intègre la création, la liste, et les détails des devis
 */
import { useState } from 'react';
import { Quote } from '@/types/quote';
import { QuoteForm } from './QuoteForm';
import { QuoteListAdmin } from './QuoteListAdmin';
import { QuoteDetail } from './QuoteDetail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const QuoteManager = () => {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('list');

  const handleQuoteCreated = (quoteId: string) => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  const handleQuoteUpdated = (quote: Quote) => {
    setRefreshKey(prev => prev + 1);
    setSelectedQuote(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lister les devis</TabsTrigger>
          <TabsTrigger value="create">Créer un devis</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {selectedQuote ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
                ← Retour à la liste
              </button>
              <QuoteDetail
                quoteId={selectedQuote.id}
                onClose={() => setSelectedQuote(null)}
                onUpdate={handleQuoteUpdated}
              />
            </div>
          ) : (
            <QuoteListAdmin
              onSelectQuote={setSelectedQuote}
              refreshTrigger={refreshKey}
            />
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <QuoteForm
            onSuccess={handleQuoteCreated}
            onCancel={() => setActiveTab('list')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
