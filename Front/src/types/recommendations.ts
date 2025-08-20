
export interface ProductRecommendation {
  id: number;
  name: string;
  artisan: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  relevanceScore: number;
}

export interface WorkshopRecommendation {
  id: number;
  title: string;
  artisan: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  duration: string;
  relevanceScore: number;
}
