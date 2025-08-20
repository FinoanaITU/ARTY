
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Store, ShoppingBag, Building, User, MapPin, Upload, X, ChevronLeft, ChevronRight, Camera, FileText, Award, Globe } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type UserRole = 'buyer' | 'artisan';
type BuyerType = 'entreprise' | 'particulier';
type LocationType = 'local' | 'etranger';

const Signup = () => {
  const [role, setRole] = useState<UserRole>('buyer');
  const [buyerType, setBuyerType] = useState<BuyerType>('particulier');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [artisanStep, setArtisanStep] = useState(1);
  const totalArtisanSteps = 5;
  
  // Photos state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    companyName: '',
    siret: '',
    
    // Artisan specific fields
    // Personal Information
    fullName: '',
    professionalEmail: '',
    artisanPhone: '',
    region: '',
    languages: [] as string[],
    
    // Artisan Account  
    artisanCompanyName: '',
    artisanPassword: '',
    artisanConfirmPassword: '',
    
    // Artisan Information
    mainSpecialty: '',
    otherSkills: [] as string[],
    yearsExperience: '',
    activityDescription: '',
    brandStory: '',
    
    // Offerings
    offerings: [] as string[], // 'products', 'workshops', 'both'
    
    // Administrative Documents
    nif: '',
    stat: '',
    documentsNotAvailable: false,
    
    // Legacy fields
    artisanSpecialty: '',
    artisanDescription: '',
    experience: ''
  });

  const { setUser } = useUser();
  const navigate = useNavigate();

  // SEO Setup
  useEffect(() => {
    document.title = 'Inscription - Artizaho | Rejoignez notre communauté d\'artisans malgaches';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 
      'Créez votre compte Artizaho pour découvrir l\'artisanat authentique de Madagascar. Inscription gratuite pour acheteurs et artisans.');
  }, []);

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error('Vous ne pouvez ajouter que 5 photos maximum');
      return;
    }
    
    setPhotos(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getLocationType = (): LocationType => {
    return selectedCountry === 'madagascar' ? 'local' : 'etranger';
  };

  const validateArtisanStep = (step: number): boolean => {
    // Validation temporairement désactivée pour prévisualisation
    return true;
    
    // Validation originale (commentée)
    /*
    switch (step) {
      case 1: // Photos - optional
        return true;
      case 2: // Additional Information - optional
        return true;
      case 3: // Artisan Account
        return !!(formData.artisanCompanyName && formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword && formData.password.length >= 6);
      case 4: // Artisan Information
        return !!(formData.mainSpecialty && formData.yearsExperience && formData.activityDescription);
      case 5: // Offerings & Documents
        return formData.offerings.length > 0;
      default:
        return false;
    }
     */
  };

  const nextStep = () => {
    if (validateArtisanStep(artisanStep)) {
      setArtisanStep(prev => Math.min(prev + 1, totalArtisanSteps));
    } else {
      toast.error('Veuillez remplir tous les champs obligatoires');
    }
  };

  const prevStep = () => {
    setArtisanStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'artisan') {
      if (artisanStep < totalArtisanSteps) {
        nextStep();
        return;
      }
      
      // Final validation for artisan
      if (!validateArtisanStep(artisanStep)) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Create artisan user
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role,
        avatar: '/placeholder.svg',
        artisanData: {
          photos: photoPreviews,
          personalInfo: {
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            region: formData.city,
            languages: formData.languages
          },
          account: {
            companyName: formData.artisanCompanyName,
            password: formData.password
          },
          artisanInfo: {
            mainSpecialty: formData.mainSpecialty,
            otherSkills: formData.otherSkills,
            yearsExperience: formData.yearsExperience,
            activityDescription: formData.activityDescription,
            brandStory: formData.brandStory
          },
          offerings: formData.offerings,
          documents: {
            nif: formData.nif,
            stat: formData.stat,
            documentsNotAvailable: formData.documentsNotAvailable
          }
        }
      };
      
      setUser(newUser as any);
      toast.success('Compte artisan créé avec succès !');
      navigate('/artisan-dashboard');
      return;
    }
    
    // Validation for buyers
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (role === 'buyer' && !selectedCountry) {
      toast.error('Veuillez sélectionner votre pays');
      return;
    }

    const locationType = getLocationType();

    // Créer l'utilisateur acheteur
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role,
      avatar: '/placeholder.svg',
      buyerType,
      locationType,
      ...(buyerType === 'entreprise' && {
        companyName: formData.companyName,
        siret: formData.siret
      })
    };

    setUser(newUser as any);
    toast.success('Compte créé avec succès !');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-orange-600 mb-4 inline-block">
            Artizaho
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-gray-600">Rejoignez notre communauté d'artisans malgaches</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-orange-600" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Choix du rôle */}
              <div>
                <Label className="text-base font-medium mb-4 block">Je suis :</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value: UserRole) => setRole(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer" className="flex items-center gap-2 cursor-pointer">
                      <ShoppingBag className="h-4 w-4 text-orange-600" />
                      Acheteur
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50">
                    <RadioGroupItem value="artisan" id="artisan" />
                    <Label htmlFor="artisan" className="flex items-center gap-2 cursor-pointer">
                      <Store className="h-4 w-4 text-orange-600" />
                      Artisan
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Options pour les acheteurs */}
              {role === 'buyer' && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-800">Informations acheteur</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Type de compte :</Label>
                      <RadioGroup
                        value={buyerType}
                        onValueChange={(value: BuyerType) => setBuyerType(value)}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="particulier" id="particulier" />
                          <Label htmlFor="particulier" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" />
                            Particulier
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="entreprise" id="entreprise" />
                          <Label htmlFor="entreprise" className="flex items-center gap-2 cursor-pointer">
                            <Building className="h-4 w-4" />
                            Entreprise
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Nationalité :</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner votre nationalité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="madagascar">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Madagascar
                            </div>
                          </SelectItem>
                          <SelectItem value="france">France</SelectItem>
                          <SelectItem value="ile-maurice">Île Maurice</SelectItem>
                          <SelectItem value="reunion">La Réunion</SelectItem>
                          <SelectItem value="comores">Comores</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="usa">États-Unis</SelectItem>
                          <SelectItem value="uk">Royaume-Uni</SelectItem>
                          <SelectItem value="allemagne">Allemagne</SelectItem>
                          <SelectItem value="italie">Italie</SelectItem>
                          <SelectItem value="espagne">Espagne</SelectItem>
                          <SelectItem value="autre">Autre pays</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedCountry === 'madagascar' && (
                        <p className="text-xs text-green-600 mt-1">
                          🎉 Vous bénéficierez des tarifs locaux préférentiels !
                        </p>
                      )}
                      {selectedCountry && selectedCountry !== 'madagascar' && (
                        <p className="text-xs text-blue-600 mt-1">
                          ℹ️ Tarifs touristes applicables
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
              </div>

              {/* Champs spécifiques aux entreprises */}
              {role === 'buyer' && buyerType === 'entreprise' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="siret">SIRET / Numéro d'entreprise</Label>
                    <Input
                      id="siret"
                      value={formData.siret}
                      onChange={(e) => handleInputChange('siret', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Multi-step form for artisans */}
              {role === 'artisan' && (
                <div className="space-y-6">
                  {/* Progress indicator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Étape {artisanStep} sur {totalArtisanSteps}</span>
                      <span>{Math.round((artisanStep / totalArtisanSteps) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(artisanStep / totalArtisanSteps) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Step 1: Photos */}
                  {artisanStep === 1 && (
                    <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Camera className="h-5 w-5 text-orange-600" />
                        <h3 className="font-medium text-orange-800">Photos de votre atelier ou créations</h3>
                      </div>
                      <p className="text-sm text-orange-700 mb-4">
                        Ajoutez jusqu'à 5 photos pour présenter votre travail (optionnel)
                      </p>
                      
                      <div className="space-y-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotosChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                        >
                          <Upload className="h-8 w-8 text-orange-500 mb-2" />
                          <span className="text-sm text-orange-600">Cliquez pour ajouter des photos</span>
                          <span className="text-xs text-orange-500">({photos.length}/5 photos)</span>
                        </label>
                        
                        {photoPreviews.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {photoPreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Aperçu ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Additional Information */}
                  {artisanStep === 2 && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-800">Informations complémentaires</h3>
                      </div>
                      
                      <div>
                        <Label>Langues parlées</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {['Français', 'Malagasy', 'Anglais', 'Allemand', 'Italien', 'Espagnol'].map((lang) => (
                            <div key={lang} className="flex items-center space-x-2">
                              <Checkbox
                                id={lang}
                                checked={formData.languages.includes(lang)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('languages', [...formData.languages, lang]);
                                  } else {
                                    handleInputChange('languages', formData.languages.filter(l => l !== lang));
                                  }
                                }}
                              />
                              <Label htmlFor={lang} className="text-sm">{lang}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Artisan Account */}
                  {artisanStep === 3 && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-800">Compte artisan</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="artisanCompanyName">Nom de l'entreprise/atelier *</Label>
                          <Input
                            id="artisanCompanyName"
                            value={formData.artisanCompanyName}
                            onChange={(e) => handleInputChange('artisanCompanyName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="artisanPassword">Mot de passe *</Label>
                            <Input
                              id="artisanPassword"
                              type="password"
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              required
                              placeholder="Utilisez le même mot de passe"
                              disabled
                            />
                          </div>
                          <div>
                            <Label htmlFor="artisanConfirmPassword">Confirmer le mot de passe *</Label>
                            <Input
                              id="artisanConfirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              required
                              placeholder="Mot de passe déjà confirmé"
                              disabled
                            />
                          </div>
                        </div>
                        <p className="text-sm text-green-600">
                          ✓ Le mot de passe a déjà été défini dans les informations de base
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Artisan Information */}
                  {artisanStep === 4 && (
                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="h-5 w-5 text-purple-600" />
                        <h3 className="font-medium text-purple-800">Informations artisanales</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="mainSpecialty">Spécialité principale *</Label>
                          <Select
                            value={formData.mainSpecialty}
                            onValueChange={(value) => handleInputChange('mainSpecialty', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir une spécialité" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vannerie">Vannerie</SelectItem>
                              <SelectItem value="poterie">Poterie</SelectItem>
                              <SelectItem value="textile">Textile</SelectItem>
                              <SelectItem value="sculpture">Sculpture sur bois</SelectItem>
                              <SelectItem value="bijouterie">Bijouterie</SelectItem>
                              <SelectItem value="maroquinerie">Maroquinerie</SelectItem>
                              <SelectItem value="broderie">Broderie</SelectItem>
                              <SelectItem value="peinture">Peinture</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Autres compétences</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {['Vannerie', 'Poterie', 'Textile', 'Sculpture', 'Bijouterie', 'Maroquinerie', 'Broderie', 'Peinture'].map((skill) => (
                              <div key={skill} className="flex items-center space-x-2">
                                <Checkbox
                                  id={skill}
                                  checked={formData.otherSkills.includes(skill)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleInputChange('otherSkills', [...formData.otherSkills, skill]);
                                    } else {
                                      handleInputChange('otherSkills', formData.otherSkills.filter(s => s !== skill));
                                    }
                                  }}
                                />
                                <Label htmlFor={skill} className="text-sm">{skill}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="yearsExperience">Années d'expérience *</Label>
                          <Select
                            value={formData.yearsExperience}
                            onValueChange={(value) => handleInputChange('yearsExperience', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="moins-1">Moins d'1 an</SelectItem>
                              <SelectItem value="1-3">1 à 3 ans</SelectItem>
                              <SelectItem value="3-5">3 à 5 ans</SelectItem>
                              <SelectItem value="5-10">5 à 10 ans</SelectItem>
                              <SelectItem value="plus-10">Plus de 10 ans</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="activityDescription">Description de votre activité *</Label>
                          <Textarea
                            id="activityDescription"
                            value={formData.activityDescription}
                            onChange={(e) => handleInputChange('activityDescription', e.target.value)}
                            placeholder="Décrivez vos créations, votre savoir-faire..."
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="brandStory">Histoire de votre marque (optionnel)</Label>
                          <Textarea
                            id="brandStory"
                            value={formData.brandStory}
                            onChange={(e) => handleInputChange('brandStory', e.target.value)}
                            placeholder="Racontez l'histoire de votre marque, votre inspiration..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Offerings & Documents */}
                  {artisanStep === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Store className="h-5 w-5 text-orange-600" />
                          <h3 className="font-medium text-orange-800">Vos offres *</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {[
                            { value: 'products', label: 'Vente de produits finis', desc: 'Je vends mes créations artisanales' },
                            { value: 'workshops', label: 'Ateliers d\'apprentissage', desc: 'J\'enseigne mon savoir-faire' },
                            { value: 'both', label: 'Les deux', desc: 'Je vends ET j\'enseigne' }
                          ].map((offering) => (
                            <div key={offering.value} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-white transition-colors">
                              <Checkbox
                                id={offering.value}
                                checked={formData.offerings.includes(offering.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('offerings', [...formData.offerings, offering.value]);
                                  } else {
                                    handleInputChange('offerings', formData.offerings.filter(o => o !== offering.value));
                                  }
                                }}
                              />
                              <div>
                                <Label htmlFor={offering.value} className="font-medium cursor-pointer">{offering.label}</Label>
                                <p className="text-sm text-muted-foreground">{offering.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium text-blue-800">Documents administratifs</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nif">Numéro NIF</Label>
                            <Input
                              id="nif"
                              value={formData.nif}
                              onChange={(e) => handleInputChange('nif', e.target.value)}
                              placeholder="Ex: 123456789"
                              disabled={formData.documentsNotAvailable}
                            />
                          </div>
                          <div>
                            <Label htmlFor="stat">Numéro STAT</Label>
                            <Input
                              id="stat"
                              value={formData.stat}
                              onChange={(e) => handleInputChange('stat', e.target.value)}
                              placeholder="Ex: 987654321"
                              disabled={formData.documentsNotAvailable}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="documentsNotAvailable"
                            checked={formData.documentsNotAvailable}
                            onCheckedChange={(checked) => handleInputChange('documentsNotAvailable', !!checked)}
                          />
                          <Label htmlFor="documentsNotAvailable" className="text-sm">
                            Je n'ai pas encore ces documents
                          </Label>
                        </div>
                        
                        <p className="text-xs text-blue-600">
                          ℹ️ Ces documents pourront être ajoutés plus tard dans votre profil
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons for artisan steps */}
                  <div className="flex justify-between items-center mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={artisanStep === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      Étape {artisanStep} / {totalArtisanSteps}
                    </span>
                    
                    {artisanStep < totalArtisanSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        Créer mon compte artisan
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Submit button for buyers only */}
              {role === 'buyer' && (
                <div className="flex flex-col gap-4">
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                    Créer mon compte
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="text-orange-600 hover:underline">
                      Se connecter
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Login link for all users */}
              {role === 'artisan' && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="text-orange-600 hover:underline">
                    Se connecter
                  </Link>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
