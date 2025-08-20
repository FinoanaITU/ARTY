
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface WorkshopFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedEventType: string;
  setSelectedEventType: (eventType: string) => void;
  selectedDuration: string;
  setSelectedDuration: (duration: string) => void;
  selectedGroupSize: string;
  setSelectedGroupSize: (groupSize: string) => void;
  onResetFilters: () => void;
  resultsCount: number;
}

const categories = ['Tous', 'Sculpture', 'Textile', 'Céramique', 'Bijouterie', 'Vannerie'];
const difficulties = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];
const types = ['Tous', 'inscription', 'reservation'];
const eventTypes = ['Tous', 'Teambuilding', 'EVJF', 'Anniversaires', 'Date', 'Famille', 'Entre amis'];
const durations = ['Tous', '2-3h', '4-5h', '6h+'];
const groupSizes = ['Tous', '1-5 pers.', '6-10 pers.', '11-15 pers.', '16+ pers.'];

const WorkshopFilters: React.FC<WorkshopFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedType,
  setSelectedType,
  selectedEventType,
  setSelectedEventType,
  selectedDuration,
  setSelectedDuration,
  selectedGroupSize,
  setSelectedGroupSize,
  onResetFilters,
  resultsCount
}) => {
  const hasActiveFilters = selectedCategory !== 'Tous' || 
                          selectedDifficulty !== 'Tous' || 
                          selectedType !== 'Tous' ||
                          selectedEventType !== 'Tous' ||
                          selectedDuration !== 'Tous' ||
                          selectedGroupSize !== 'Tous' ||
                          searchTerm.trim() !== '';

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres de recherche
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher un atelier, instructeur ou lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'atelier</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'Tous' ? 'Tous les types' : 
                     type === 'inscription' ? 'Date fixe' : 'Date flexible'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taille du groupe</label>
            <Select value={selectedGroupSize} onValueChange={setSelectedGroupSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupSizes.map((groupSize) => (
                  <SelectItem key={groupSize} value={groupSize}>
                    {groupSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="flex justify-center pt-2">
            <Button 
              variant="outline" 
              onClick={onResetFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkshopFilters;
