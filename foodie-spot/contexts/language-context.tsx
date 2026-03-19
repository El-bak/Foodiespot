import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { translations, Language } from '@/constants/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations['fr'];
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'fr',
    setLanguage: () => {},
    t: translations.fr,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('fr');

    useEffect(() => {

        // C'est pour charger la langue sauvegardée
        storage.getItem<Language>('language').then(saved => {
            if (saved === 'fr' || saved === 'en') {
                setLanguageState(saved);
            }
        });
    }, []);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        await storage.setItem('language', lang);
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t: translations[language],
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);