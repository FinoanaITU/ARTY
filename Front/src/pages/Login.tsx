
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    buyerType: 'particulier' as 'particulier' | 'entreprise',
    locationType: 'local' as 'local' | 'etranger'
  });
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo login - in real app this would authenticate against backend
    const demoUser = {
      id: '1',
      name: 'Marie Dubois',
      email: formData.email,
      role: 'buyer' as const,
      avatar: '/placeholder.svg',
      buyerType: formData.buyerType,
      locationType: formData.locationType,
      companyName: formData.buyerType === 'entreprise' ? 'Mon Entreprise SARL' : undefined,
      siret: formData.buyerType === 'entreprise' ? '12345678901234' : undefined
    };

    setUser(demoUser);
    toast.success('Connexion réussie !');
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-orange-600 mb-4 inline-block">
            Artizaho
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Se connecter</h1>
          <p className="text-gray-600">Accédez à votre compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-orange-600" />
              Connexion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Se connecter
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Vous n'avez pas de compte ?{' '}
                <Link to="/signup" className="text-orange-600 hover:underline">
                  Créer un compte
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
