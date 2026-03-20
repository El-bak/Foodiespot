import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import api, { userAPI, orderAPI, } from "@/services/api";
import { useLanguage } from '@/contexts/language-context';

export default function CheckoutScreen() {
    const { items, restaurantId, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const deliveryFee = totalPrice >= 25 ? 0 : 2.99;

    const [defaultAddress, setDefaultAddress] = useState<any>(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState<{ discount: number; message: string } | null>(null);
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const discount = promoResult?.discount ?? 0;
    const total = totalPrice + deliveryFee - discount;
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const { t } = useLanguage();

    useEffect(() => { 
        userAPI.getAddresses().then(addrs => { 
            setAddresses(addrs);
            const def = addrs.find((a: any) => a.isDefault) || addrs[0];
            setSelectedAddress(def);
        });
    }, []);

    const handleConfirmOrder = async () => {
        if (!restaurantId) {
            Alert.alert('Erreur', 'Aucun restaurant sélectionné');
            return;
        }

        if (!selectedAddress

        ) {
            Alert.alert(
                'Adresse manquante',
                'Veuillez ajouter une adresse de livraison dans votre profil'
            );
            return;
        }

        setLoading(true);
        try {
            const orderItems = items.map(item => ({
                menuItemId: item.dish.id,
                quantity: item.quantity,
            }));

            const order = await orderAPI.createOrder({
                restaurantId,
                items: orderItems,
                deliveryAddress: selectedAddress,
                paymentMethod: 'card',
            });

            clearCart();

            // Cela permet de naviguer vers le suivi de la commande
            router.replace(`/tracking/${order.id}`);
        } catch (error) {
            console.log('erreur création commande:', error);
            Alert.alert('Erreur', 'Impossible de passer la commande, réessayez');
        } finally {
            setLoading(false);
        }
    };

    const handleValidatePromo = async () => {
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError('');
        setPromoResult(null);

        try {
            const response = await api.post('/promos/validate', {
                code: promoCode.trim(),
                subtotal: totalPrice,
            });
            const result = response.data?.data;

            const discountAmount = typeof result.discount === 'number' ? result.discount : 0;
            const isDeliveryFree = result.type === 'delivery';

            setPromoResult({
                discount: isDeliveryFree ? 0 : discountAmount,
                message: result.message || 'Code promo appliqué !',
            });
        } catch (error: any) {

            // Celle-ci permet d'afficher le message d'erreur du backend
            const msg = error.response?.data?.message || 'Code invalide';
            setPromoError(msg);
        } finally {
            setPromoLoading(false);
       }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{t.confirmOrder}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.deliveryAddress}</Text>

                {addresses.length === 0 ? (
                    <Text style={styles.noAddress}>
                        Aucune adresse — ajoutez-en une dans votre profil
                    </Text>
                ) : (
                    addresses.map(addr => (
                        <TouchableOpacity
                            key={addr.id}
                            style={[styles.addressCard, selectedAddress?.id === addr.id && styles.addressCardSelected]}
                            onPress={() => setSelectedAddress(addr)}
                        >
                            <Text style={styles.addressLabel}>{addr.label}</Text>
                            <Text style={styles.addressText}>{addr.street}, {addr.city}</Text>
                            {selectedAddress?.id === addr.id && (
                                <Text style={styles.addressSelected}>✓ Sélectionnée</Text>
                            )}
                        </TouchableOpacity>
        ))
    )}
</View>

                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.summary}</Text>
                    {items.map(item => (
                        <View key={item.dish.id} style={styles.orderItem}>
                            <Text style={styles.orderItemName}>
                                {item.quantity}x {item.dish.name}
                            </Text>
                            <Text style={styles.orderItemPrice}>
                                {(item.dish.price * item.quantity).toFixed(2)} €
                            </Text>
                        </View>
                    ))}
                </View>
                
                {/* code promo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.promoCode}</Text>
                    <View style={styles.promoRow}>
                        <TextInput
                            style={styles.promoInput}
                            placeholder="Entrez votre code"
                            value={promoCode}
                            onChangeText={(text) => {
                                setPromoCode(text);
                                setPromoError('');
                                setPromoResult(null);
                            }}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            style={styles.promoButton}
                            onPress={handleValidatePromo}
                            disabled={promoLoading}
                        >
                            <Text style={styles.promoButtonText}>
                                {promoLoading ? '...' : 'OK'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {promoError !== '' && (
                        <Text style={styles.promoError}>{promoError}</Text>
                    )}
                    {promoResult && (
                        <Text style={styles.promoSuccess}>
                               {promoResult.message} {promoResult.discount > 0 ? ` (-${promoResult.discount.toFixed(2)} €)` : ''}
                        </Text>
                    )}
                </View>

                {/* total */}
                <View style={styles.section}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{t.subtotal}</Text>
                        <Text style={styles.totalValue}>{totalPrice.toFixed(2)} €</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{t.delivery}</Text>
                        <Text style={[styles.totalValue, deliveryFee === 0 && styles.free]}>
                            {deliveryFee === 0 ? t.freeDelivery : `${deliveryFee.toFixed(2)} €`}
                        </Text>
                    </View>
                    {discount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={[styles.totalLabel, { color: '#4CAF50' }]}>Réduction</Text>
                            <Text style={[styles.totalValue, { color: '#4CAF50' }]}>-{discount.toFixed(2)} €</Text>
                        </View> 
                    )}
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalLabel}>{t.total}</Text>
                        <Text style={styles.grandTotalValue}>{total.toFixed(2)} €</Text>
                    </View>
                </View>
            </ScrollView>

            
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                    onPress={handleConfirmOrder}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.confirmButtonText}>
                            {t.confirmPay} {total.toFixed(2)} €
                          </Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 16,
        gap: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
    },
    addressCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
    },
    addressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF6B35',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#444',
    },
    noAddress: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderItemName: {
        fontSize: 14,
        color: '#444',
        flex: 1,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    free: {
        color: '#4CAF50',
    },
    grandTotalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        marginTop: 4,
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    grandTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B35',
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    promoRow: {
        flexDirection: 'row',
        gap: 8,
    },
    promoInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    promoButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    promoButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    promoError: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
    },
    promoSuccess: {
        color: '#4CAF50',
        fontSize: 13,
        marginTop: 6,
        fontWeight: '600',
    },
    addressCardSelected: {
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    addressSelected: {
        color: '#FF6B35',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});