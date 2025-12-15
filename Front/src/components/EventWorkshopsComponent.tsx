  const EventWorkshopsComponent = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Ateliers sur Inscription</h2>
        <p className="text-muted-foreground">Événements programmés avec dates fixes</p>
      </div>
      
      {inscriptionLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Chargement des ateliers...</span>
        </div>
      )}
      
      {inscriptionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <p>Erreur lors du chargement: {inscriptionError}</p>
        </div>
      )}
      
      {!inscriptionLoading && inscriptionWorkshops.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {inscriptionWorkshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img src={workshop.featured_image_url} alt={workshop.title} className="w-full h-full object-cover" />
                <Badge className="absolute top-2 right-2 bg-orange-600 text-white">Sur Inscription</Badge>
                <Badge className="absolute bottom-2 left-2 bg-primary">{workshop.skill_level}</Badge>
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {workshop.tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} className="bg-blue-500 text-white text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{workshop.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    {workshop.artisan.avatar ? (
                      <img
                        src={workshop.artisan.avatar}
                        alt={workshop.artisan.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">{workshop.artisan.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm">{workshop.artisan.name}</div>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{workshop.short_description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(workshop.duration_minutes / 60)}h</span>
                    <MapPin className="h-4 w-4 ml-4" />
                    <span className="truncate">{workshop.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{workshop.min_participants}-{workshop.max_participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-semibold text-primary">
                      {workshop.base_price.toLocaleString()} {workshop.currency}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Sessions programmées :</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {workshop.sessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="bg-gray-50 p-2 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span>{new Date(session.start_datetime).toLocaleDateString('fr-FR')} à {new Date(session.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded ${session.needs_min_participants ? 'bg-orange-100 text-orange-600' : session.is_full ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {session.current_bookings}/{session.max_participants}
                            </span>
                          </div>
                        </div>
                        {session.needs_min_participants && (
                          <div className="text-orange-600 mt-1">
                            Minimum {workshop.min_participants} participants requis
                          </div>
                        )}
                      </div>
                    ))}
                    {workshop.sessions.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{workshop.sessions.length - 3} autres sessions
                      </div>
                    )}
                  </div>
                </div>
                
                <Link to={`/workshop/${workshop.id}`}>
                  <Button className="w-full">
                    Voir détails et s'inscrire
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!inscriptionLoading && inscriptionWorkshops.length === 0 && !inscriptionError && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun atelier sur inscription disponible pour le moment.</p>
        </div>
      )}
    </div>
  );