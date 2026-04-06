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
    
    setTimeout(() => {
      setActiveTab('list');
    }, 1500);
  };

  const handleQuoteUpdated = (quote: Quote) => {
    setRefreshKey(prev => prev + 1);
    setSelectedQuote(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Gestion des Devis</h2>
        <p className="text-gray-700">
          Créez, listez et gérez tous vos demandes de devis en un seul endroit
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">📋 Mes devis</TabsTrigger>
          <TabsTrigger value="create">➕ Créer un devis</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {selectedQuote ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-2"
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
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                ➕ Créer une nouvelle demande de devis
              </CardTitle>
              <CardDescription>
                Remplissez tous les champs pour créer un devis. Les paramètres administrateur sont optionnels.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <QuoteForm
                onSuccess={handleQuoteCreated}
                onCancel={() => setActiveTab('list')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
