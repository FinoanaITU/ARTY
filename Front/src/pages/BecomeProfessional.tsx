import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, TrendingUp, Award, ArrowRight, Star } from 'lucide-react';
import workshopArtisan from '@/assets/workshop-artisan.jpg';

const BecomeProfessional = () => {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-artisan-orange" />,
      title: "Communauté d'artisans",
      description: "Rejoignez une communauté passionnée et partagez votre savoir-faire avec d'autres créateurs talentueux."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-artisan-orange" />,
      title: "Augmentez vos revenus",
      description: "Vendez vos créations et animez des ateliers pour diversifier vos sources de revenus."
    },
    {
      icon: <Award className="w-8 h-8 text-artisan-orange" />,
      title: "Valorisez votre expertise",
      description: "Transmettez vos techniques traditionnelles et créez des liens authentiques avec les participants."
    }
  ];

  const artisanTypes = [
    {
      type: "Artisan Artizaho",
      subtitle: "Focus production & vente",
      features: [
        "Créez et vendez vos produits artisanaux",
        "Accès à notre marketplace",
        "Gestion simplifiée des commandes",
        "Support marketing de base",
        "Idéal pour débuter dans l'artisanat"
      ],
      badge: "Débutant",
      color: "bg-blue-50 border-blue-200"
    },
    {
      type: "Artisan Uber",
      subtitle: "Marque établie + ateliers",
      features: [
        "Votre marque déjà établie",
        "Animation d'ateliers d'apprentissage",
        "Livraison de produits finis",
        "Outils de gestion avancés",
        "Programme de fidélité clients"
      ],
      badge: "Expérimenté",
      color: "bg-purple-50 border-purple-200"
    }
  ];

  const testimonials = [
    {
      name: "Hery Rakoto",
      type: "Artisan Uber",
      text: "Grâce à Artizaho, j'ai pu faire connaître mon travail de sculpture au-delà de mon village. Les ateliers que j'anime permettent de transmettre notre patrimoine culturel.",
      rating: 5,
      location: "Antananarivo"
    },
    {
      name: "Voahangy Razafy",
      type: "Artisan Artizaho",
      text: "J'ai commencé petit avec mes tissages traditionnels. Maintenant, je vends régulièrement mes créations et ai même formé d'autres artisans de ma région.",
      rating: 5,
      location: "Fianarantsoa"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-artisan-brown mb-6">
              Devenez Artisan Partenaire
            </h1>
            <p className="text-xl text-artisan-text max-w-3xl mx-auto mb-8">
              Rejoignez notre plateforme et partagez votre passion de l'artisanat malgache avec une communauté qui valorise l'authenticité et le savoir-faire traditionnel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-artisan-orange hover:bg-artisan-orange/90 text-white px-8 py-3 text-lg">
                  S'inscrire maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-artisan-orange text-artisan-orange hover:bg-artisan-orange/10 px-8 py-3 text-lg">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-artisan-brown text-center mb-12">
              Pourquoi nous rejoindre ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-artisan-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-artisan-brown mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-artisan-text/80">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Artisan Types Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-artisan-brown text-center mb-4">
              Quel type d'artisan êtes-vous ?
            </h2>
            <p className="text-lg text-artisan-text text-center mb-12 max-w-2xl mx-auto">
              Choisissez le profil qui correspond le mieux à votre situation et vos objectifs
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {artisanTypes.map((artisan, index) => (
                <Card key={index} className={`${artisan.color} p-6 hover:shadow-xl transition-all duration-300`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle className="text-2xl text-artisan-brown">
                        {artisan.type}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-artisan-orange text-white">
                        {artisan.badge}
                      </Badge>
                    </div>
                    <CardDescription className="text-lg text-artisan-text/80">
                      {artisan.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {artisan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-artisan-text">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Process Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-artisan-brown text-center mb-12">
              Comment ça marche ?
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Inscription", desc: "Créez votre profil artisan en quelques minutes" },
                { step: "2", title: "Validation", desc: "Notre équipe examine votre candidature" },
                { step: "3", title: "Formation", desc: "Découvrez nos outils et meilleures pratiques" },
                { step: "4", title: "Lancement", desc: "Commencez à vendre et animer vos ateliers" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-artisan-orange rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-artisan-brown mb-2">
                    {item.title}
                  </h3>
                  <p className="text-artisan-text/80">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-artisan-brown text-center mb-12">
              Témoignages d'artisans
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-artisan-text mb-6 italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-artisan-brown">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-artisan-text/60">
                          {testimonial.location}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-artisan-orange text-artisan-orange">
                        {testimonial.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-artisan-brown/5 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-artisan-brown mb-6">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-lg text-artisan-text mb-8 max-w-2xl mx-auto">
              Rejoignez dès aujourd'hui notre communauté d'artisans passionnés et commencez à partager votre savoir-faire unique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-artisan-orange hover:bg-artisan-orange/90 text-white px-8 py-3 text-lg">
                  Créer mon compte artisan
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-artisan-brown text-artisan-brown hover:bg-artisan-brown/10 px-8 py-3 text-lg">
                  Poser une question
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BecomeProfessional;