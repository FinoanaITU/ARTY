import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiService from '@/services/api';
import { toast } from '@/hooks/use-toast';

const TestLogin = () => {
  const [email, setEmail] = useState('artisan.test@artizaho.mg');
  const [password, setPassword] = useState('testpass123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      console.log('Login success:', response);
      
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast({
        title: "Connexion réussie",
        description: `Connecté en tant que ${response.user.name} (${response.user.role})`
      });
      
      
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.detail || error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Login Artisan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
          <div className="text-sm text-gray-600">
            <p>Compte test artisan :</p>
            <p>Email: artisan.test@artizaho.mg</p>
            <p>Mot de passe: testpass123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestLogin;