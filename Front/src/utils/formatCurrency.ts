/**
 * Format currency based on language/locale
 * @param amount The amount to format
 * @param language 'fr' for French (€) or 'mg' for Malagasy (Ar)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null, language: 'fr' | 'mg' = 'mg'): string => {
  if (amount === null || amount === undefined) {
    return '-';
  }

  if (language === 'fr') {
    // French locale: use € (Euro)
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  } else {
    // Malagasy: use Ar (Ariary)
    return `${amount.toLocaleString('fr-FR')} Ar`;
  }
};

/**
 * Format currency using context language directly
 * For components with access to useLanguage hook
 */
export const useCurrencyFormatter = (language: 'fr' | 'mg') => {
  return (amount: number | undefined | null) => formatCurrency(amount, language);
};
