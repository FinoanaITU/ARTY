# Plan d'Attaque de Développement - ARTY

## Introduction

Ce document sert de plan de développement agile pour le projet ARTY. Il est basé sur l'analyse du code existant (Frontend et Backend) et le rapport de fonctionnalités manquantes. L'objectif est de fournir une feuille de route claire, organisée en sprints, pour l'équipe de développement.

En tant que Scrum Master, mon rôle est de faciliter ce processus, de m'assurer que les priorités sont claires et d'aider à lever les obstacles.

## Product Backlog (Priorisé)

Le backlog contient la liste de toutes les fonctionnalités (Epics) à développer, classées par ordre de priorité. Chaque Epic est décomposé en User Stories plus petites et gérables.

---

### 🔴 EPIC 1: Finalisation du Cycle de Vente (Priorité CRITIQUE)

*Ces fonctionnalités sont essentielles pour permettre une transaction complète sur la plateforme.*

-   **User Story 1.1 (Panier):** En tant qu'utilisateur, je veux que mon panier soit synchronisé avec mon compte pour le retrouver sur différents appareils.
    -   **Tâches techniques:**
        -   Créer le service `cart_service.py`.
        -   Implémenter les endpoints API (`/api/carts/...`) pour ajouter, voir, mettre à jour et supprimer des articles.
        -   Logique de fusion du panier local (anonyme) avec le panier du compte après connexion.
-   **User Story 1.2 (Commande):** En tant que client, je veux pouvoir passer une commande à partir de mon panier.
    -   **Tâches techniques:**
        -   Créer le service `order_service.py`.
        -   Implémenter l'endpoint pour créer une commande à partir d'un panier.
        -   Logique de validation du stock, calcul des totaux (prix, taxe, etc.) et génération d'un numéro de commande unique.
        -   Créer un "snapshot" des informations du produit au moment de la commande.
-   **User Story 1.3 (Paiement):** En tant que client, je veux pouvoir payer ma commande de manière sécurisée via Stripe.
    -   **Tâches techniques:**
        -   Créer le service `stripe_service.py`.
        -   Intégrer Stripe PaymentIntents.
        -   Créer un endpoint pour générer une session de paiement.
        -   Mettre en place un webhook pour écouter les événements de paiement Stripe (succès, échec).
        -   Mettre à jour le statut de la commande en fonction du résultat du paiement.
-   **User Story 1.4 (Gestion Commande):** En tant qu'artisan, je veux voir et gérer les commandes que je reçois.
    -   **Tâches techniques:**
        -   Implémenter les endpoints pour que l'artisan puisse lister ses commandes.
        -   Implémenter la logique pour changer le statut d'une commande (en production, prêt pour collecte, etc.).

---

### 🟠 EPIC 2: Gestion des Utilisateurs et Profils (Priorité HAUTE)

*Ces fonctionnalités sont nécessaires pour que les utilisateurs puissent gérer leurs informations et interagir avec la plateforme.*

-   **User Story 2.1 (Profil Utilisateur):** En tant qu'utilisateur (client ou artisan), je veux pouvoir modifier les informations de mon profil.
    -   **Tâches techniques:**
        -   Implémenter les endpoints `PUT/PATCH` pour `/api/users/me` et `/api/artisans/me`.
        -   Permettre la mise à jour des informations de base, des adresses, et des détails spécifiques à l'artisan (spécialité, etc.).
        -   Gérer l'upload et la suppression de photos de profil/atelier.
-   **User Story 2.2 (Sécurité):** En tant qu'utilisateur, je veux pouvoir réinitialiser mon mot de passe si je l'oublie.
    -   **Tâches techniques:**
        -   Activer et implémenter les endpoints `/auth/forgot-password` et `/auth/reset-password`.
        -   Intégrer un service d'envoi d'email (ex: SendGrid) pour le lien de réinitialisation.
        -   Générer et valider des tokens de réinitialisation sécurisés et temporaires.
-   **User Story 2.3 (Abonnements):** En tant qu'artisan, je veux que mon abonnement soit géré par le système pour débloquer des fonctionnalités.
    -   **Tâches techniques:**
        -   Créer les modèles de données pour les abonnements.
        -   Implémenter les endpoints pour la gestion des abonnements (côté admin).
        -   Lier les fonctionnalités (ex: nombre de produits) au statut de l'abonnement de l'artisan.

---

### 🟡 EPIC 3: Amélioration de l'Engagement (Priorité MOYENNE)

*Ces fonctionnalités enrichissent l'expérience utilisateur et favorisent l'interaction.*

-   **User Story 3.1 (Avis):** En tant que client, je veux pouvoir laisser un avis (note + commentaire + photo) sur un produit que j'ai acheté.
    -   **Tâches techniques:**
        -   Implémenter les endpoints CRUD pour les avis.
        -   Ajouter la logique de "verified_purchase".
        -   Mettre à jour automatiquement la note moyenne et le nombre d'avis sur les produits/ateliers.
-   **User Story 3.2 (Notifications):** En tant qu'utilisateur, je veux recevoir des notifications pertinentes concernant mes activités.
    -   **Tâches techniques:**
        -   Créer un service de notifications.
        -   Implémenter les endpoints pour lister et marquer les notifications comme lues.
        -   Générer des notifications pour les événements clés (nouvelle commande, changement de statut, etc.).
-   **User Story 3.3 (Statistiques Artisan):** En tant qu'artisan, je veux voir un tableau de bord avec mes statistiques de vente.
    -   **Tâches techniques:**
        -   Implémenter l'endpoint pour agréger et retourner les statistiques (ventes, revenus, produits populaires).
        -   Créer une tâche de fond (ou un calcul à la volée) pour maintenir les statistiques à jour.

---

## Proposition de Sprints

### Sprint 1 (2 semaines) - Objectif: Activer les Ventes

*Focus sur le chemin critique de l'achat.*

1.  **[Panier]** Implémentation du service et des APIs de gestion du panier (User Story 1.1).
2.  **[Commande]** Implémentation de la création de commande (User Story 1.2).
3.  **[Paiement]** Intégration de base de Stripe (création du PaymentIntent) (Partie de User Story 1.3).
4.  **[Sécurité]** Implémentation de la réinitialisation de mot de passe (User Story 2.2).

### Sprint 2 (2 semaines) - Objectif: Finaliser la Transaction et la Gestion

*Focus sur la finalisation du paiement et la gestion post-achat.*

1.  **[Paiement]** Finalisation de l'intégration Stripe avec le webhook pour la confirmation (User Story 1.3).
2.  **[Gestion Commande]** Endpoints pour la gestion des commandes par l'artisan (User Story 1.4).
3.  **[Profil Utilisateur]** Mise à jour du profil client et artisan (User Story 2.1).
4.  **[Admin]** Mise en place des endpoints de base pour le dashboard admin (ventes totales, nombre d'artisans).

### Sprint 3 (2 semaines) - Objectif: Enrichir l'Expérience

*Focus sur les fonctionnalités qui augmentent la confiance et l'engagement.*

1.  **[Avis]** Système complet d'avis et notations (User Story 3.1).
2.  **[Notifications]** Service de notifications pour les événements de commande (User Story 3.2).
3.  **[Statistiques Artisan]** Tableau de bord pour l'artisan (User Story 3.3).

## Definition of Done (DoD)

Pour qu'une User Story soit considérée comme "terminée", elle doit respecter les critères suivants :
-   Le code est écrit et versionné sur une branche de fonctionnalité.
-   Les migrations de base de données (Alembic) sont créées si nécessaire.
-   Des tests unitaires et d'intégration pertinents sont écrits et passent avec succès.
-   La documentation de l'API (si applicable) est mise à jour.
-   Une Pull Request (PR) a été créée, revue par au moins un autre membre de l'équipe, et approuvée.
-   La branche de fonctionnalité a été fusionnée sur la branche principale (`main` ou `develop`).

## Prochaines Étapes

1.  **Revue du Plan:** Discutons de ce plan ensemble pour s'assurer qu'il est aligné avec la vision du produit.
2.  **Préparation du Sprint 1:** Créons les tickets correspondants dans notre outil de gestion de projet (Jira, Trello, etc.) pour les stories du Sprint 1.
3.  **Lancement du Sprint 1:** Commençons le développement !

Ce plan est un document vivant. Nous l'adapterons à chaque fin de sprint en fonction de nos apprentissages et des nouvelles priorités. Allons-y !
