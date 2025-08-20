import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Package, 
  Download,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface WorkshopSession {
  id: string;
  workshopTitle: string;
  date: Date;
  time: string;
  location: string;
  artisan: {
    name: string;
    phone: string;
  };
  locationContact?: {
    name: string;
    phone: string;
    email: string;
  };
  coOrganizers?: Array<{
    name: string;
    role: string;
    phone: string;
  }>;
  participants: Participant[];
  materials: string[];
  checklist: {
    materialPrepared: boolean;
    participantsContacted: boolean;
    workshopCompleted: boolean;
  };
}

interface WorkshopDayManagerProps {
  workshopSessions: WorkshopSession[];
  onUpdateChecklist: (sessionId: string, field: keyof WorkshopSession['checklist'], value: boolean) => void;
  onDownloadLogistics: (sessionId: string) => void;
}

const WorkshopDayManager: React.FC<WorkshopDayManagerProps> = ({
  workshopSessions,
  onUpdateChecklist,
  onDownloadLogistics
}) => {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const getSessionStatus = (session: WorkshopSession) => {
    const checklist = session.checklist;
    const completed = Object.values(checklist).filter(Boolean).length;
    const total = Object.keys(checklist).length;

    if (completed === total) {
      return { status: 'completed', color: 'bg-green-100 text-green-800', text: 'Terminé' };
    } else if (completed > 0) {
      return { status: 'in-progress', color: 'bg-orange-100 text-orange-800', text: `${completed}/${total} tâches` };
    } else {
      return { status: 'pending', color: 'bg-gray-100 text-gray-800', text: 'À commencer' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">📅 Ateliers du jour</h2>
        <Badge variant="secondary">{workshopSessions.length} session{workshopSessions.length > 1 ? 's' : ''}</Badge>
      </div>

      {workshopSessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun atelier prévu pour aujourd'hui</p>
          </CardContent>
        </Card>
      ) : (
        workshopSessions.map((session) => {
          const status = getSessionStatus(session);
          const isExpanded = expandedSession === session.id;

          return (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedSession(isExpanded ? null : session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">{session.workshopTitle}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {session.participants.length} participants
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={status.color}>
                      {status.text}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadLogistics(session.id);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Fiche PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-6">
                  {/* Quick Actions Checklist */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Suivi opérationnel
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`material-${session.id}`}
                          checked={session.checklist.materialPrepared}
                          onCheckedChange={(checked) => 
                            onUpdateChecklist(session.id, 'materialPrepared', checked as boolean)
                          }
                        />
                        <label htmlFor={`material-${session.id}`} className="text-sm">
                          Matériel préparé
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`contact-${session.id}`}
                          checked={session.checklist.participantsContacted}
                          onCheckedChange={(checked) => 
                            onUpdateChecklist(session.id, 'participantsContacted', checked as boolean)
                          }
                        />
                        <label htmlFor={`contact-${session.id}`} className="text-sm">
                          Participants contactés
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`completed-${session.id}`}
                          checked={session.checklist.workshopCompleted}
                          onCheckedChange={(checked) => 
                            onUpdateChecklist(session.id, 'workshopCompleted', checked as boolean)
                          }
                        />
                        <label htmlFor={`completed-${session.id}`} className="text-sm">
                          Atelier terminé
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Artisan & Contacts */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Artisan
                        </h4>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="font-medium">{session.artisan.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {session.artisan.phone}
                          </div>
                        </div>
                      </div>

                      {session.locationContact && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Contact du lieu
                          </h4>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="font-medium">{session.locationContact.name}</div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {session.locationContact.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {session.locationContact.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {session.coOrganizers && session.coOrganizers.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Co-organisateurs logistiques</h4>
                          <div className="space-y-2">
                            {session.coOrganizers.map((co, index) => (
                              <div key={index} className="bg-muted/50 p-3 rounded-lg">
                                <div className="font-medium">{co.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {co.role} - {co.phone}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Materials & Participants */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Matériel à préparer/transporter
                        </h4>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <ul className="text-sm space-y-1">
                            {session.materials.map((material, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                                {material}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Liste des participants
                        </h4>
                        <div className="bg-muted/50 p-3 rounded-lg max-h-40 overflow-y-auto">
                          <div className="space-y-2">
                            {session.participants.map((participant) => (
                              <div key={participant.id} className="text-sm">
                                <div className="font-medium">{participant.name}</div>
                                <div className="text-muted-foreground text-xs">
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {participant.email}
                                  </div>
                                  {participant.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {participant.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

export default WorkshopDayManager;