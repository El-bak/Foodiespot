import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Star, Camera } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import api from "@/services/api";
import { useTheme } from '@/contexts/theme-context';

export default function ReviewScreen() {
    const { orderId, restaurantId } = useLocalSearchParams<{
        orderId: string;
        restaurantId: string;
    }>();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const { colors } = useTheme();
  
    const [qualityRating, setQualityRating] = useState(0);
    const [speedRating, setSpeedRating] = useState(0);
    const [presentationRating, setPresentationRating] = useState(0);

    const handleAddPhoto = async () => {

        
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Autorisation requise', "Nous avons besoin d'accéder à vos photos pour fonctionner");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {

            // La limite ici est de 3 photos
            if (photos.length >= 3) {
                Alert.alert('Maximum atteint', 'Vous pouvez ajouter maximum 3 photos');
                return;
            }
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Laisser un avis', 'Veuillez nous donner une note globale pour votre commande');
            return;
        }

        setLoading(true);
        try {
            await api.post('/reviews', {
                restaurantId,
                orderId,
                rating,
                comment,
                qualityRating: qualityRating > 0 ? qualityRating : undefined,
                speedRating: speedRating > 0 ? speedRating : undefined,
                presentationRating: presentationRating > 0 ? presentationRating : undefined,
            });

            Alert.alert(
                'Merci !',
                'Votre avis a été publié',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/orders') }]
            );
        } catch (error) {
            console.log('erreur envoi avis:', error);
            Alert.alert('Erreur', 'Impossible de publier votre avis');
        } finally {
            setLoading(false);
        }
    };

    // Ce composant est réutilisable pour afficher des étoiles
    const StarRating = ({
        value,
        onChange,
        size = 32
    }: {
        value: number;
        onChange: (v: number) => void;
        size?: number
    }) => (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onChange(star)}>
                    <Star
                        size={size}
                        color="#FFC107"
                        fill={star <= value ? '#FFC107' : 'transparent'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Laisser un avis</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* note globale */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Note globale</Text>
                    <StarRating value={rating} onChange={setRating} size={40} />
                    {rating > 0 && (
                        <Text style={styles.ratingText}>
                            {rating === 1 && 'Très mauvais'}
                            {rating === 2 && 'Mauvais'}
                            {rating === 3 && 'Moyen'}
                            {rating === 4 && 'Bien'}
                            {rating === 5 && 'Excellent !'}
                        </Text>
                    )}
                </View>

                {/* sous-notes par critère */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes par critère (optionnel)</Text>

                    <View style={styles.criteriaRow}>
                        <Text style={styles.criteriaLabel}>Qualité</Text>
                        <StarRating value={qualityRating} onChange={setQualityRating} size={24} />
                    </View>

                    <View style={styles.criteriaRow}>
                        <Text style={styles.criteriaLabel}>Rapidité</Text>
                        <StarRating value={speedRating} onChange={setSpeedRating} size={24} />
                    </View>

                    <View style={styles.criteriaRow}>
                        <Text style={styles.criteriaLabel}>Présentation</Text>
                        <StarRating value={presentationRating} onChange={setPresentationRating} size={24} />
                    </View>
                </View>

                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos (optionnel)</Text>
                    <View style={styles.photosRow}>
                        {photos.map((uri, index) => (
                            <View key={index} style={styles.photoWrapper}>
                                <Image source={{ uri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhoto}
                                    onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                                >
                                    <Text style={styles.removePhotoText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {photos.length < 3 && (
                            <TouchableOpacity style={styles.addPhoto} onPress={handleAddPhoto}>
                                <Camera size={24} color="#999" />
                                <Text style={styles.addPhotoText}>Ajouter</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Partagez votre expérience..."
                        placeholderTextColor="#aaa"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, (loading || rating === 0) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading || rating === 0}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.submitButtonText}>Publier mon avis</Text>
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
        marginBottom: 16,
        color: '#333',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 4,
    },
    ratingText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B35',
        marginTop: 8,
    },
    criteriaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    criteriaLabel: {
        fontSize: 14,
        color: '#444',
        width: 90,
    },
    photosRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    photoWrapper: {
        position: 'relative',
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removePhoto: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removePhotoText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    addPhoto: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    addPhotoText: {
        fontSize: 11,
        color: '#999',
    },
    commentInput: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        minHeight: 100,
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});