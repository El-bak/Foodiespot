import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { storage } from '@/services/storage';

const { width } = Dimensions.get('window');


const slides = [
    {
        id: '1',
        emoji: '🍔',
        title: 'Bienvenue sur FoodieSpot',
        description: 'Découvrez les meilleurs restaurants et plats près de chez vous, commandez en quelques clics et régalez-vous !',
    },
    {
        id: '2',
        emoji: '🚀',
        title: 'Livraison rapide',
        description: 'Suivez votre commande en temps réel et recevez vos plats en moins de 30 minutes',
    },
    {
        id: '3',
        emoji: '⭐',
        title: 'Vos avis comptent',
        description: 'Notez vos restaurants préférés et partagez votre expérience avec les autres',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {

            // Ici ça permet de passer au slide suivant
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {

        
        await storage.setItem('onboarding_done', true);
        router.replace('/(auth)/login');
    };

    const renderSlide = ({ item }: { item: typeof slides[0] }) => (
        <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
           

            <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>

            
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
            />

            
            <View style={styles.dots}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, index === currentIndex && styles.dotActive]}
                    />
                ))}
            </View>

            {/* bouton suivant / commencer */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                    {currentIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    skipButton: {
        alignSelf: 'flex-end',
        padding: 16,
    },
    skipText: {
        fontSize: 16,
        color: '#999',
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 16,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    dotActive: {
        backgroundColor: '#FF6B35',
        width: 24,
    },
    nextButton: {
        backgroundColor: '#FF6B35',
        marginHorizontal: 32,
        marginBottom: 32,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});