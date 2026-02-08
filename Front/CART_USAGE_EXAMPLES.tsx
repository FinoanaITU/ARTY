/**
 * EXEMPLES D'UTILISATION DU PANIER
 * =================================
 * 
 * Ce fichier contient des exemples de code pour utiliser
 * la fonctionnalité panier dans vos composants React.
 */

import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/types/cart';

// ============================================
// EXEMPLE 1: Ajouter un produit au panier
// ============================================

function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '/placeholder.jpg',
      artisan: product.artisan_name,
      description: product.description,
    });

    // Optionnel: Afficher une notification
    alert(`${product.name} ajouté au panier !`);
  };

  return (
    <button onClick={handleAddToCart}>
      Ajouter au panier
    </button>
  );
}

// ============================================
// EXEMPLE 2: Ajouter un atelier au panier
// ============================================

function WorkshopBooking({ workshop, selectedDate, selectedTime }: any) {
  const { addItem } = useCart();

  const handleBookWorkshop = () => {
    addItem({
      type: 'workshop',
      workshopId: workshop.id,
      name: workshop.title,
      price: workshop.price,
      quantity: 1,
      image: workshop.banner_image,
      artisan: workshop.artisan_name,
      selectedDate: new Date(selectedDate),
      selectedTime: selectedTime,
      description: workshop.description,
    });

    alert('Atelier ajouté au panier !');
  };

  return (
    <button onClick={handleBookWorkshop}>
      Réserver cet atelier
    </button>
  );
}

// ============================================
// EXEMPLE 3: Ajouter un abonnement au panier
// ============================================

function SubscriptionPlan({ plan }: any) {
  const { addItem } = useCart();

  const handleSubscribe = () => {
    addItem({
      type: 'subscription',
      subscriptionPlanId: plan.id,
      name: plan.name,
      price: plan.price,
      quantity: 1,
      image: '/subscription-icon.jpg',
      description: plan.description,
      subscriptionDetails: {
        duration: plan.duration,
        credits: plan.credits,
        features: plan.features,
      },
    });

    alert('Abonnement ajouté au panier !');
  };

  return (
    <button onClick={handleSubscribe}>
      S'abonner
    </button>
  );
}

// ============================================
// EXEMPLE 4: Afficher le nombre d'articles
// ============================================

function MyCustomHeader() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <div>
      Panier: {itemCount} article{itemCount > 1 ? 's' : ''}
    </div>
  );
}

// ============================================
// EXEMPLE 5: Afficher le total du panier
// ============================================

function CartSummaryWidget() {
  const { getTotalPrice, getItemCount } = useCart();
  const total = getTotalPrice();
  const count = getItemCount();

  if (count === 0) {
    return <div>Votre panier est vide</div>;
  }

  return (
    <div>
      <p>{count} articles</p>
      <p>Total: {total.toLocaleString()} Ar</p>
    </div>
  );
}

// ============================================
// EXEMPLE 6: Liste des articles avec gestion
// ============================================

function MiniCartDropdown() {
  const { items, removeItem, updateQuantity } = useCart();

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <img src={item.image} alt={item.name} />
          <h4>{item.name}</h4>
          <p>{item.price} Ar</p>
          
          {/* Modifier la quantité */}
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
            -
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            +
          </button>
          
          {/* Supprimer */}
          <button onClick={() => removeItem(item.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXEMPLE 7: Ajouter avec variation de prix
// ============================================

function TouristPriceProduct({ product, userType }: any) {
  const { addItem } = useCart();

  const handleAddWithPricing = () => {
    let priceVariation = undefined;

    // Si c'est un touriste, appliquer le prix majoré
    if (userType === 'tourist' && product.tourist_price) {
      priceVariation = {
        type: 'tourist' as const,
        originalPrice: product.price,
        discountedPrice: product.tourist_price,
        discountPercentage: Math.round(
          ((product.tourist_price - product.price) / product.price) * 100
        ),
      };
    }

    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      priceVariation: priceVariation,
    });
  };

  return (
    <button onClick={handleAddWithPricing}>
      Ajouter au panier
      {userType === 'tourist' && (
        <span> ({product.tourist_price} Ar)</span>
      )}
    </button>
  );
}

// ============================================
// EXEMPLE 8: Ajouter avec plan de paiement
// ============================================

function InstallmentPaymentProduct({ product }: any) {
  const { addItem } = useCart();

  const handleAddWithInstallment = () => {
    const depositAmount = product.price * 0.3; // 30% d'acompte
    const remainingAmount = product.price * 0.7;

    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      paymentPlan: {
        type: 'installment',
        depositAmount: depositAmount,
        remainingAmount: remainingAmount,
        depositDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        remainingDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      },
    });

    alert('Produit ajouté avec paiement en 2 fois !');
  };

  return (
    <button onClick={handleAddWithInstallment}>
      Ajouter (paiement en 2x)
    </button>
  );
}

// ============================================
// EXEMPLE 9: Vérifier si un produit est dans le panier
// ============================================

function ProductWithCartStatus({ productId }: { productId: string }) {
  const { items } = useCart();

  const isInCart = items.some(
    (item) => item.type === 'product' && item.productId === productId
  );

  const cartItem = items.find(
    (item) => item.type === 'product' && item.productId === productId
  );

  return (
    <div>
      {isInCart ? (
        <div>
          ✓ Dans le panier ({cartItem?.quantity} article{cartItem!.quantity > 1 ? 's' : ''})
        </div>
      ) : (
        <div>Pas encore dans le panier</div>
      )}
    </div>
  );
}

// ============================================
// EXEMPLE 10: Afficher les articles par artisan
// ============================================

function CartByArtisan() {
  const { getItemsByArtisan } = useCart();
  const itemsByArtisan = getItemsByArtisan();

  return (
    <div>
      {Object.entries(itemsByArtisan).map(([artisan, items]) => (
        <div key={artisan}>
          <h3>{artisan}</h3>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.name} x {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXEMPLE 11: Bouton "Vider le panier"
// ============================================

function ClearCartButton() {
  const { clearCart, getItemCount } = useCart();
  const count = getItemCount();

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
      clearCart();
      alert('Panier vidé !');
    }
  };

  if (count === 0) return null;

  return (
    <button onClick={handleClear}>
      Vider le panier ({count})
    </button>
  );
}

// ============================================
// EXEMPLE 12: Hook personnalisé pour gérer l'ajout
// ============================================

import { useState } from 'react';

function useAddToCart() {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const addProductToCart = async (product: any) => {
    setIsAdding(true);
    
    try {
      // Optionnel: Appel API pour vérifier stock
      // await apiService.checkStock(product.id);
      
      addItem({
        type: 'product',
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0],
        artisan: product.artisan_name,
      });
      
      // Success notification
      return { success: true };
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      return { success: false, error };
    } finally {
      setIsAdding(false);
    }
  };

  return { addProductToCart, isAdding };
}

// Utilisation:
function ProductCardWithLoading({ product }: any) {
  const { addProductToCart, isAdding } = useAddToCart();

  const handleClick = async () => {
    const result = await addProductToCart(product);
    if (result.success) {
      alert('Produit ajouté !');
    }
  };

  return (
    <button onClick={handleClick} disabled={isAdding}>
      {isAdding ? 'Ajout en cours...' : 'Ajouter au panier'}
    </button>
  );
}

// ============================================
// EXEMPLE 13: Rediriger vers le panier après ajout
// ============================================

import { useNavigate } from 'react-router-dom';

function QuickAddAndGoToCart({ product }: any) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddAndNavigate = () => {
    addItem({
      type: 'product',
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
    });

    // Rediriger immédiatement vers le panier
    navigate('/cart');
  };

  return (
    <button onClick={handleAddAndNavigate}>
      Acheter maintenant
    </button>
  );
}

// ============================================
// NOTES IMPORTANTES
// ============================================

/*
1. PERSISTANCE:
   - Le panier est sauvegardé automatiquement dans localStorage
   - Clé: 'artizaho-cart'
   - Persiste entre les sessions

2. TYPE SAFETY:
   - Toujours utiliser les types de '@/types/cart'
   - L'IDE vous aidera avec l'autocomplétion

3. VALIDATION:
   - Vérifier les stocks avant d'ajouter (optionnel)
   - Vérifier les limites de quantité
   - Valider les dates pour les ateliers

4. UX:
   - Toujours donner un feedback utilisateur
   - Afficher des notifications (toast)
   - Désactiver les boutons pendant le traitement

5. BACKEND:
   - Pour synchroniser avec l'API, utiliser apiService
   - Voir Front/src/services/api.ts lignes 620-646
   - Endpoints disponibles: GET /carts/me, POST /carts/items, etc.
*/

export {};
