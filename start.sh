#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLEAN_MODE=false
NO_SEED=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header() {
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

show_help() {
    cat << EOF
Usage: ./start.sh [OPTIONS]

Démarre le projet ARTIZAHO avec tous les services et données nécessaires.

OPTIONS:
    --clean         Nettoie les volumes Docker avant de démarrer
    --no-seed       Démarre sans créer les données de démonstration
    -h, --help      Affiche cette aide

EXEMPLES:
    ./start.sh
    ./start.sh --clean
    ./start.sh --no-seed

EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_MODE=true
            shift
            ;;
        --no-seed)
            NO_SEED=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

print_header "Vérifications préalables"

if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi
print_success "Docker est installé"

if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose n'est pas installé"
    exit 1
fi
print_success "docker-compose est installé"

if ! docker info &> /dev/null; then
    print_error "Docker n'est pas en cours d'exécution"
    exit 1
fi
print_success "Docker est en cours d'exécution"

if [ ! -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    print_error "Fichier docker-compose.yml non trouvé"
    exit 1
fi
print_success "Fichier docker-compose.yml trouvé"

if [ "$CLEAN_MODE" = true ]; then
    print_header "Nettoyage des volumes Docker"
    print_warning "Cela va supprimer toutes les données existantes !"
    read -p "Êtes-vous sûr ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        print_success "Volumes Docker nettoyés"
    else
        print_info "Nettoyage annulé"
    fi
fi

print_header "Démarrage des services Docker"

docker-compose up -d

print_success "Services Docker démarrés"

print_header "Attente que les services soient prêts"

wait_for_service() {
    local service=$1
    local max_attempts=60
    local attempt=0
    
    echo -n "Attente de $service..."
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep "$service" | grep -q "healthy"; then
            echo ""
            print_success "$service est prêt"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
    print_warning "$service n'est pas devenu healthy après $max_attempts tentatives"
    print_info "Continuons quand même..."
    return 1
}

wait_for_service "postgres"

wait_for_service "redis"

wait_for_service "backend"

print_header "Exécution des migrations de base de données"

docker-compose exec -T backend alembic upgrade head

if [ $? -eq 0 ]; then
    print_success "Migrations exécutées avec succès"
else
    print_error "Erreur lors de l'exécution des migrations"
    print_info "Vérifiez les logs: docker-compose logs backend"
    exit 1
fi

print_header "Création des données initiales"

docker-compose exec -T backend python scripts/seed_initial_data.py

if [ $? -eq 0 ]; then
    print_success "Données initiales créées"
else
    print_warning "Erreur lors de la création des données initiales"
    print_info "Les données existent peut-être déjà"
fi

if [ "$NO_SEED" = false ]; then
    print_header "Création des données de démonstration"
    
    docker-compose exec -T backend python scripts/seed_demo_data.py
    
    if [ $? -eq 0 ]; then
        print_success "Données de démonstration créées"
    else
        print_warning "Erreur lors de la création des données de démo"
        print_info "Les données existent peut-être déjà"
    fi
else
    print_info "Création des données de démo ignorée (--no-seed)"
fi

print_header "Vérification de la santé des services"

if curl -f http://localhost:8000/health &> /dev/null; then
    print_success "Backend est accessible"
else
    print_warning "Backend n'est pas accessible"
fi

if curl -f http://localhost:8080 &> /dev/null; then
    print_success "Frontend est accessible"
else
    print_warning "Frontend n'est pas encore accessible (peut prendre quelques secondes)"
fi

print_header "Projet ARTIZAHO démarré avec succès !"

echo ""
echo -e "${GREEN} URLs d'accès :${NC}"
echo -e "   ${BLUE}Frontend :${NC}        http://localhost:8080"
echo -e "   ${BLUE}Backend API :${NC}     http://localhost:8000"
echo -e "   ${BLUE}Documentation API :${NC} http://localhost:8000/docs"
echo ""
echo -e "${GREEN}👤 Comptes de test :${NC}"
echo ""
echo -e "   ${YELLOW}Admin :${NC}"
echo -e "   - Email :    admin@artizaho.com"
echo -e "   - Password : admin123"
echo ""
echo -e "   ${YELLOW}Artisan :${NC}"
echo -e "   - Email :    artisan@artizaho.com"
echo -e "   - Password : artisan123"
echo ""
echo -e "   ${YELLOW}Acheteur Particulier :${NC}"
echo -e "   - Email :    acheteur@artizaho.com"
echo -e "   - Password : acheteur123"
echo ""
echo -e "   ${YELLOW}Acheteur Entreprise :${NC}"
echo -e "   - Email :    entreprise@artizaho.com"
echo -e "   - Password : entreprise123"
echo ""

if [ "$NO_SEED" = false ]; then
    echo -e "${GREEN} Données créées :${NC}"
    echo -e "   - 12 catégories avec sous-catégories"
    echo -e "   - 4 comptes utilisateurs"
    echo -e "   - ~6 produits artisanaux"
    echo -e "   - ~2 ateliers avec sessions"
    echo -e "   - Avis et photos de démonstration"
    echo ""
fi

echo -e "${RED} ATTENTION :${NC} Ces mots de passe sont pour le développement uniquement !"
echo ""
echo -e "${BLUE}Commandes utiles :${NC}"
echo -e "   ${YELLOW}docker-compose logs -f${NC}          # Voir tous les logs"
echo -e "   ${YELLOW}docker-compose logs -f backend${NC}  # Logs du backend"
echo -e "   ${YELLOW}docker-compose logs -f frontend${NC} # Logs du frontend"
echo -e "   ${YELLOW}docker-compose down${NC}             # Arrêter les services"
echo -e "   ${YELLOW}docker-compose restart${NC}          # Redémarrer les services"
echo ""
print_header "Bon développement !"

