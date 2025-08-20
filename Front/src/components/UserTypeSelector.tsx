import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface UserTypeSelectorProps {
  selectedUserType: string;
  onUserTypeChange: (type: any) => void;
  userTypeLabels: Record<string, string>;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedUserType,
  onUserTypeChange,
  userTypeLabels
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-brand-brown">Type de participant</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sélectionnez votre profil pour bénéficier des tarifs préférentiels
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedUserType}
          onValueChange={onUserTypeChange}
          className="space-y-3"
        >
          {Object.entries(userTypeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
              <RadioGroupItem value={type} id={type} />
              <div className="flex-1">
                <Label htmlFor={type} className="cursor-pointer flex items-center justify-between">
                  <span>{label}</span>
                  {type !== 'tourist' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Réduction
                    </Badge>
                  )}
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default UserTypeSelector;