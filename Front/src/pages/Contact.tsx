import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    console.log('Contact form submitted:', formData);
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais."
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-artisan-brown mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-artisan-text max-w-2xl mx-auto">
              Une question ? Un projet particulier ? Nous sommes là pour vous accompagner dans votre découverte de l'artisanat malgache.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-artisan-brown mb-6">
                Informations de contact
              </h2>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-artisan-orange/10 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-artisan-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-artisan-brown mb-2">Email</h3>
                        <p className="text-artisan-text">contact@artizaho.mg</p>
                        <p className="text-sm text-artisan-text/70">Réponse sous 24h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-artisan-orange/10 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-artisan-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-artisan-brown mb-2">Téléphone</h3>
                        <p className="text-artisan-text">+261 20 XX XX XX</p>
                        <p className="text-sm text-artisan-text/70">Lun-Ven: 9h-17h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-artisan-orange/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-artisan-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-artisan-brown mb-2">Adresse</h3>
                        <p className="text-artisan-text">Lot XXX Antananarivo 101</p>
                        <p className="text-artisan-text">Madagascar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-artisan-orange/10 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-artisan-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-artisan-brown mb-2">Horaires</h3>
                        <p className="text-artisan-text">Lundi - Vendredi: 9h00 - 17h00</p>
                        <p className="text-artisan-text">Samedi: 9h00 - 12h00</p>
                        <p className="text-artisan-text">Dimanche: Fermé</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-artisan-brown">Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+261 XX XX XX XXX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inquiryType">Type de demande</Label>
                        <Select value={formData.inquiryType} onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Question générale</SelectItem>
                            <SelectItem value="artisan">Devenir artisan</SelectItem>
                            <SelectItem value="workshop">Ateliers</SelectItem>
                            <SelectItem value="products">Produits</SelectItem>
                            <SelectItem value="partnership">Partenariat</SelectItem>
                            <SelectItem value="technical">Support technique</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Sujet</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Résumé de votre message"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Décrivez votre demande en détail..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-artisan-orange hover:bg-artisan-orange/90 text-white"
                    >
                      Envoyer le message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-artisan-brown mb-8 text-center">
              Questions fréquentes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-artisan-brown mb-3">
                    Comment puis-je devenir artisan partenaire ?
                  </h3>
                  <p className="text-artisan-text/80">
                    Cliquez sur "Devenir artisan" en haut de la page ou contactez-nous directement. Nous vous accompagnerons dans le processus d'inscription.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-artisan-brown mb-3">
                    Proposez-vous des ateliers pour enfants ?
                  </h3>
                  <p className="text-artisan-text/80">
                    Oui ! Consultez notre section "Artikidz" dans les ateliers pour découvrir nos activités spécialement conçues pour les enfants.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-artisan-brown mb-3">
                    Livrez-vous dans toute l'île ?
                  </h3>
                  <p className="text-artisan-text/80">
                    Nous livrons principalement dans les grandes villes. Contactez-nous pour connaître les zones de livraison disponibles.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-artisan-brown mb-3">
                    Puis-je annuler ma réservation d'atelier ?
                  </h3>
                  <p className="text-artisan-text/80">
                    Les annulations sont possibles jusqu'à 48h avant l'atelier. Consultez nos conditions générales pour plus de détails.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;