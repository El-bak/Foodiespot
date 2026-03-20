
// Ici on va tester les fonction les plus importantes
// --- Validation email ---
const isValidEmail = (email: string): boolean => {
    return email.includes('@') && email.includes('.');
};

// --- Validation mot de passe ---
const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};

// --- Calcul total panier ---
const calculateTotal = (items: { price: number; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// --- Frais de livraison ---
const getDeliveryFee = (total: number): number => {
    return total >= 25 ? 0 : 2.99;
};

// --- Code promo ---
const isValidPromoCode = (code: string): boolean => {
    const validCodes = ['BIENVENUE30', 'FOODIE10', 'LIVRAISON'];
    return validCodes.includes(code.toUpperCase());
};

// ==========================================

describe('Validation email', () => {
    test('email correct est accepté', () => {
        expect(isValidEmail('test@gmail.com')).toBe(true);
    });

    test('email sans @ est refusé', () => {
        expect(isValidEmail('testgmail.com')).toBe(false);
    });

    test('email vide est refusé', () => {
        expect(isValidEmail('')).toBe(false);
    });
});

describe('Validation mot de passe', () => {
    test('mot de passe de 6 caractères est accepté', () => {
        expect(isValidPassword('123456')).toBe(true);
    });

    test('mot de passe trop court est refusé', () => {
        expect(isValidPassword('123')).toBe(false);
    });

    test('mot de passe vide est refusé', () => {
        expect(isValidPassword('')).toBe(false);
    });
});

describe('Calcul total panier', () => {
    test('panier vide = 0', () => {
        expect(calculateTotal([])).toBe(0);
    });

    test('un article = prix correct', () => {
        expect(calculateTotal([{ price: 12.90, quantity: 1 }])).toBe(12.90);
    });

    test('deux articles = total correct', () => {
        expect(calculateTotal([
            { price: 12.90, quantity: 1 },
            { price: 11.90, quantity: 2 }
        ])).toBeCloseTo(36.70);
    });
});

describe('Frais de livraison', () => {
    test('livraison gratuite si total >= 25€', () => {
        expect(getDeliveryFee(25)).toBe(0);
        expect(getDeliveryFee(30)).toBe(0);
    });

    test('livraison 2.99€ si total < 25€', () => {
        expect(getDeliveryFee(10)).toBe(2.99);
        expect(getDeliveryFee(24)).toBe(2.99);
    });
});

describe('Code promo', () => {
    test('BIENVENUE30 est valide', () => {
        expect(isValidPromoCode('BIENVENUE30')).toBe(true);
    });

    test('FOODIE10 est valide', () => {
        expect(isValidPromoCode('FOODIE10')).toBe(true);
    });

    test('code invalide est refusé', () => {
        expect(isValidPromoCode('FAUX123')).toBe(false);
    });

    test('code en minuscules fonctionne', () => {
        expect(isValidPromoCode('bienvenue30')).toBe(true);
    });
});