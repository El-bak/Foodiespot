import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Trash2, MapPin, Check } from 'lucide-react-native';
import { userAPI } from '@/services/api';
import type { Address } from '@/types';

export default function AddressesScreen() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    
    const [label, setLabel] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const data = await userAPI.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.log('erreur chargement adresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!label.trim() || !street.trim() || !city.trim()) {
            Alert.alert('Champs manquants', 'Veuillez remplir au moins le nom, la rue et la ville');
            return;
        }

        setSaving(true);
        try {
            await userAPI.addAddress({
                label: label.trim(),
                street: street.trim(),
                city: city.trim(),
                postalCode: postalCode.trim(),
                country: 'France',
                coordinates: { latitude: 0, longitude: 0 },
            });

            // Ici ça permte de vider le formulaire et de le recharger
            setLabel('');
            setStreet('');
            setCity('');
            setPostalCode('');
            setModalVisible(false);
            await loadAddresses();
        } catch (error) {
            console.log('erreur ajout adresse:', error);
            Alert.alert('Erreur', "Impossible d'ajouter l'adresse");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Supprimer',
            'Voulez-vous supprimer cette adresse ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userAPI.deleteAddress(id);
                            await loadAddresses();
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de supprimer');
                        }
                    }
                }
            ]
        );
    };

    const handleSetDefault = async (id: string) => {
        try {
            await userAPI.updateAddress(id, { isDefault: true });
            await loadAddresses();
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de définir comme adresse par défaut');
        }
    };

    const renderAddress = ({ item }: { item: Address }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
                <MapPin size={20} color="#FF6B35" />
            </View>
            <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{item.label}</Text>
                <Text style={styles.addressText}>{item.street}</Text>
                <Text style={styles.addressText}>{item.postalCode} {item.city}</Text>
                {item.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Par défaut</Text>
                    </View>
                )}
            </View>
            <View style={styles.addressActions}>
                {!item.isDefault && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Check size={18} color="#4CAF50" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(item.id)}
                >
                    <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Mes adresses</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Plus size={24} color="#FF6B35" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAddress}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📍</Text>
                            <Text style={styles.emptyText}>Aucune adresse enregistrée</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={styles.addButtonText}>Ajouter une adresse</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Nouvelle adresse</Text>
                        <TouchableOpacity onPress={handleAdd} disabled={saving}>
                            <Text style={styles.saveText}>
                                {saving ? '...' : 'Enregistrer'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.fieldLabel}>Nom (ex: Maison, Bureau)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Maison"
                            value={label}
                            onChangeText={setLabel}
                        />

                        <Text style={styles.fieldLabel}>Rue</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="15 rue de la Paix"
                            value={street}
                            onChangeText={setStreet}
                        />

                        <Text style={styles.fieldLabel}>Ville</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Paris"
                            value={city}
                            onChangeText={setCity}
                        />

                        <Text style={styles.fieldLabel}>Code postal</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="75001"
                            value={postalCode}
                            onChangeText={setPostalCode}
                            keyboardType="numeric"
                        />
                    </View>
                </SafeAreaView>
            </Modal>
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
    list: {
        padding: 16,
        gap: 12,
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    addressIcon: {
        marginTop: 2,
    },
    addressInfo: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
        color: '#333',
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    defaultBadge: {
        marginTop: 6,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    defaultBadgeText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    addressActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 6,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyIcon: {
        fontSize: 48,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    addButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    modal: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    cancelText: {
        fontSize: 16,
        color: '#999',
    },
    saveText: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: '700',
    },
    form: {
        padding: 16,
        gap: 8,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#666',
        marginTop: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
});