import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';
import baobabHero from '@/assets/baobab-hero.jpg';
import workshopArtisan from '@/assets/workshop-artisan.jpg';
import cloudDivider from '@/assets/cloud-divider.png';

const featuredProducts = [
  {
    id: 1,
    name: 'Papier antemoro décoratif',
    artisan: 'Rakoto Michel',
    price: 20.00,
    location: 'Antananarivo',
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop',
    category: 'PAPIER ANTEMORO',
    rating: 4.8,
    stock: 'En stock',
    type: 'product'
  },
  {
    id: 2,
    name: 'Bouquet séché artisanal',
    artisan: 'Hery Rasoamanana', 
    price: 35.00,
    location: 'Fianarantsoa',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop',
    category: 'FLORAL',
    rating: 4.9,
    stock: 'En stock',
    type: 'product'
  },
  {
    id: 3,
    name: 'Bracelet en cuir tressé',
    artisan: 'Naina Andriamalala',
    price: 15.00,
    location: 'Mahajanga',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop',
    category: 'CUIR',
    rating: 4.7,
    stock: 'En stock',
    type: 'product'
  },
  {
    id: 4,
    name: 'Atelier : Initiation à l\'apiculture',
    artisan: 'Paul Razafy',
    price: 45.00,
    location: 'Antananarivo',
    image: 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=400&h=400&fit=crop',
    category: 'ATELIER',
    rating: 4.9,
    duration: '2h30',
    type: 'workshop'
  }
];

const testimonials = [
  {
    id: 1,
    text: "Nous mettons en valeur les artisans malgaches pour faire revivre la culture et le savoir-faire en proposant une série d'ateliers ouverts au public.",
    author: "Guy Hawkins",
    role: "President of Sales"
  },
  {
    id: 2,
    text: "Nous mettons en valeur les artisans malgaches pour faire revivre la culture et le savoir-faire en proposant une série d'ateliers ouverts au public.",
    author: "Kristin Watson", 
    role: "Marketing Coordinator"
  },
  {
    id: 3,
    text: "Nous mettons en valeur les artisans malgaches pour faire revivre la culture et le savoir-faire en proposant une série d'ateliers ouverts au public.",
    author: "Jerome Bell",
    role: "Web Designer"
  }
];

const Index = () => {
  const { t } = useLanguage();
  const { isLoggedIn } = useUser();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Section with Madagascar Baobab Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with baobab trees */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${baobabHero})`,
          }}
        >
          {/* Gradient overlay for better text readability with smooth blend */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 transition-opacity duration-700"></div>
        </div>
        
        {/* Cloud divider at bottom with seamless blend */}
        <div className="absolute bottom-0 left-0 right-0 h-40 md:h-48 lg:h-56">
          {/* Gradient blend to create seamless transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
          <div 
            className="absolute bottom-0 left-0 right-0 h-full bg-no-repeat bg-bottom bg-cover opacity-90 mix-blend-multiply"
            style={{
              backgroundImage: `url(${cloudDivider})`,
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)'
            }}
          ></div>
        </div>
        
        {/* Hero Content with entrance animations */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl animate-[slideUp_1s_ease-out_0.2s_both]">
            DÉCOUVREZ LE SAVOIR-FAIRE
            <br />
            <span className="text-accent animate-[slideUp_1s_ease-out_0.4s_both]">DE NOS ARTISANS PASSIONNÉS !</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-lg animate-[slideUp_1s_ease-out_0.6s_both]">
            Des professionnels talentueux vous accueillent dans leurs ateliers uniques pour vous transmettre leur art et savoir-faire artisanal. Repartez avec votre création réalisée à la main !
          </p>

          {/* Action Buttons with staggered animation */}
          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto animate-[slideUp_1s_ease-out_0.8s_both]">
            <Link to="/products">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl">
                Découvrir les produits
              </Button>
            </Link>
            <Link to="/workshops">
              <Button variant="outline" className="w-full border-white text-white hover:bg-white/10 py-3 rounded-full font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
                {t('workshops')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator with enhanced animation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-[bounce_2s_infinite] hover:animate-pulse cursor-pointer">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center transition-all duration-300 hover:border-white hover:scale-110">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-[scrollDot_2s_infinite]"></div>
          </div>
        </div>
      </section>

      {/* Section Notre Mission et Domaine */}
      <section className="px-4 py-16 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-artisan-brown mb-6 border-b-2 border-artisan-brown inline-block pb-2">
              NOTRE MISSION
            </h2>
            <p className="text-artisan-text text-lg max-w-3xl mx-auto leading-relaxed">
              Préserver et valoriser l'artisanat traditionnel malgache en connectant les artisans passionnés avec des clients soucieux d'authenticité et de qualité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Ce que nous faisons */}
            <div className="text-center">
              <div className="w-16 h-16 bg-artisan-brown rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-artisan-brown mb-4">CE QUE NOUS FAISONS</h3>
              <p className="text-artisan-text leading-relaxed">
                Nous créons une plateforme unique qui met en relation artisans malgaches et amateurs d'artisanat authentique. 
                Nos artisans proposent leurs créations uniques et partagent leur savoir-faire à travers des ateliers immersifs.
              </p>
            </div>

            {/* Notre domaine */}
            <div className="text-center">
              <div className="w-16 h-16 bg-artisan-brown rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-artisan-brown mb-4">NOTRE DOMAINE</h3>
              <p className="text-artisan-text leading-relaxed">
                Spécialisés dans l'artisanat traditionnel malgache : papier antemoro, vannerie, sculpture sur bois, 
                bijoux en perles, textiles traditionnels, cuir travaillé et bien plus encore. 
                Chaque création raconte une histoire et perpétue un savoir ancestral.
              </p>
            </div>

            {/* Pourquoi nous le faisons */}
            <div className="text-center">
              <div className="w-16 h-16 bg-artisan-brown rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-artisan-brown mb-4">POURQUOI NOUS LE FAISONS</h3>
              <p className="text-artisan-text leading-relaxed">
                Parce que l'artisanat malgache est un trésor culturel qui risque de disparaître. 
                Nous croyons en la transmission des savoirs traditionnels et en la valorisation du travail des artisans locaux 
                pour préserver ce patrimoine unique tout en créant des opportunités économiques durables.
              </p>
            </div>
          </div>

          {/* Section Qui Sommes Nous */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image de l'équipe */}
            <div className="relative">
              <img 
                src={workshopArtisan} 
                alt="Équipe Artizaho" 
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
              />
              {/* Effet de découpe en pointillés */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-dashed border-artisan-brown rounded-full"></div>
            </div>
            
            {/* Contenu texte */}
            <div>
              <h2 className="text-3xl font-bold text-artisan-brown mb-6 border-b-2 border-artisan-brown inline-block pb-2">
                QUI SOMMES NOUS
              </h2>
              <p className="text-artisan-text mb-8 leading-relaxed text-lg">
                Nous sommes une équipe passionnée qui met en valeur les artisans malgaches pour faire revivre la culture et le savoir-faire 
                en proposant une série d'ateliers ouverts au public et une marketplace authentique.
              </p>
              <Button className="bg-artisan-brown hover:bg-artisan-brown/90 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2">
                En savoir plus sur nous
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Les Nouveautés - Produits et Ateliers */}
      <section className="px-4 py-16 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-artisan-brown mb-4 border-b-2 border-artisan-brown inline-block pb-2">
              LES NOUVEAUTÉS
            </h2>
            <p className="text-artisan-text/70 text-lg mt-4">Nos derniers produits artisanaux et ateliers</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 rounded-2xl bg-white shadow-lg group">
                <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-artisan-brown uppercase tracking-wide">
                    {product.category}
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                    <svg className="w-4 h-4 text-artisan-brown" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-artisan-brown mb-2">{product.name}</h3>
                  
                  {product.type === 'product' ? (
                    <>
                      <p className="text-sm text-artisan-text/60 mb-4">
                        Créé par {product.artisan} à {product.location}. Produit artisanal authentique fabriqué selon les traditions malgaches.
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-artisan-text/60">
                          <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </span>
                          {product.stock}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-artisan-text/60">
                          <MapPin className="w-4 h-4" />
                          {product.location}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-artisan-text/60 mb-4">
                        Atelier animé par {product.artisan}. Découvrez les techniques traditionnelles dans une ambiance conviviale.
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-artisan-text/60">
                          <span className="w-4 h-4 rounded-full bg-artisan-brown flex items-center justify-center">
                            <span className="text-xs text-white">⏱</span>
                          </span>
                          {product.duration}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-artisan-text/60">
                          <MapPin className="w-4 h-4" />
                          {product.location}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-xl text-artisan-brown">
                      {product.price.toFixed(2)}€
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-artisan-text/60">{product.rating}</span>
                    </div>
                  </div>
                  
                  {/* Bouton d'achat rapide */}
                  <Button className="w-full bg-artisan-brown hover:bg-artisan-brown/90 text-white py-2 rounded-full font-medium transition-all duration-300 hover:scale-105">
                    {product.type === 'product' ? 'Ajouter au panier' : 'Réserver maintenant'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Témoignages - exacte du Figma */}
      <section className="px-4 py-16 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-artisan-brown mb-4 border-b-2 border-artisan-brown inline-block pb-2">
              TÉMOIGNAGE ET AVIS DE CLIENTS
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="text-center">
                {/* Quote icon circle */}
                <div className="w-16 h-16 bg-artisan-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                </div>
                
                <p className="text-artisan-text mb-8 leading-relaxed text-lg">
                  {testimonial.text}
                </p>
                
                <div>
                  <h4 className="font-bold text-artisan-brown text-lg">{testimonial.author}</h4>
                  <p className="text-artisan-text/60 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-12">
            <div className="w-3 h-3 bg-artisan-brown rounded-full"></div>
            <div className="w-3 h-3 bg-artisan-brown/30 rounded-full"></div>
            <div className="w-3 h-3 bg-artisan-brown/30 rounded-full"></div>
            <div className="w-3 h-3 bg-artisan-brown/30 rounded-full"></div>
            <div className="w-3 h-3 bg-artisan-brown/30 rounded-full"></div>
            <div className="w-3 h-3 bg-artisan-brown/30 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Simple Signup CTA for non-logged users */}
      {!isLoggedIn && (
        <section className="px-4 py-16 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-accent/20 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Rejoignez notre communauté artisanale
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Découvrez les créations uniques de nos artisans malgaches et participez à des ateliers authentiques
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/become-professional">
                  <Button className="bg-accent hover:bg-primary text-accent-foreground px-8 py-3 rounded-full font-medium">
                    Devenir artisan partenaire
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 px-8 py-3 rounded-full font-medium">
                    Créer un compte client
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
