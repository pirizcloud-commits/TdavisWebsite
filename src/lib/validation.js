/**
 * Validates that product variants don't contain misconfigured monetary denominations.
 * This guard prevents charging an amount inconsistent with the selected gift-card denomination.
 * 
 * @param {Object} product The Shopify product object
 * @returns {boolean} True if the product is misconfigured (unsafe), false otherwise
 */
export function isProductMisconfigured(product) {
    if (!product || !product.variants || !product.variants.edges) return false;
    
    // We specifically check for "Denominations" to detect gift cards safely
    // without hard-coding product handles.
    const isGiftCard = product.variants.edges.some(edge => 
        edge.node.selectedOptions && edge.node.selectedOptions.some(opt => opt.name.toLowerCase().includes('denomination'))
    );

    if (!isGiftCard) return false;

    // Check all variants for disagreements
    for (const edge of product.variants.edges) {
        const variant = edge.node;
        if (!variant.selectedOptions) continue;
        
        const denominationOpt = variant.selectedOptions.find(opt => opt.name.toLowerCase().includes('denomination'));
        if (!denominationOpt || !denominationOpt.value) continue;

        // Extract numerical value from denomination, assuming format like "$25.00" or "25 USD"
        const denominationStr = denominationOpt.value.replace(/[^0-9.]/g, '');
        const parsedDenomination = parseFloat(denominationStr);

        if (isNaN(parsedDenomination)) continue;

        const priceStr = variant.price?.amount;
        if (priceStr == null) continue; // If price is missing entirely, this is handled elsewhere

        const parsedPrice = parseFloat(priceStr);

        // If denomination is a valid number, it must match the price exactly.
        if (parsedDenomination !== parsedPrice) {
            return true;
        }
    }

    return false;
}
