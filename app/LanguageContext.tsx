import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization"; // Cihaz dilini almak için
import tr from "@/languages/tr";
import en from "@/languages/en";

type BaseTranslations = {
  login: {
    title: string;
    subTitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    loginButtonText: string;
    dontHaveAccount: string;
    registerLinkText: string;
  };
};

const LANGUAGES: Record<string, BaseTranslations> = { en, tr };
const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES); // ["en", "tr"]
const DEVICE_LANGUAGE = Localization.locale.split("-")[0]; // "en-US" gibi değerlerden sadece "en" almak için
const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.includes(DEVICE_LANGUAGE) ? DEVICE_LANGUAGE : "en";

type LanguageContextType = {
  language: string;
  translations: BaseTranslations;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type LanguageProviderProps = {
  children: React.ReactNode;
  user?: { uid: string } | null;
};

export function LanguageProvider({ children, user }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<BaseTranslations>(LANGUAGES[DEFAULT_LANGUAGE]);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        if (user) {
          // Kullanıcı giriş yaptıysa Firestore’dan dili al
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userLanguage = userDoc.exists() ? userDoc.data().language : null;

          if (userLanguage && LANGUAGES[userLanguage]) {
            setLanguageState(userLanguage);
            setTranslations(LANGUAGES[userLanguage]);
            await AsyncStorage.setItem("userLanguage", userLanguage);
            return;
          }
        }

        // Kullanıcı giriş yapmadıysa veya Firestore’da dil kaydı yoksa AsyncStorage’dan çek
        const cachedLanguage = await AsyncStorage.getItem("userLanguage");
        if (cachedLanguage && LANGUAGES[cachedLanguage]) {
          setLanguageState(cachedLanguage);
          setTranslations(LANGUAGES[cachedLanguage]);
          return;
        }

        // Eğer hiçbir kayıt yoksa, cihazın dilini kontrol et
        setLanguageState(DEFAULT_LANGUAGE);
        setTranslations(LANGUAGES[DEFAULT_LANGUAGE]);
        await AsyncStorage.setItem("userLanguage", DEFAULT_LANGUAGE);
      } catch (error) {
        console.error("Error fetching language:", error);
      }
    };

    loadLanguage();
  }, [user]);

  const setLanguage = async (lang: string) => {
    if (!LANGUAGES[lang] || lang === language) return;

    try {
      if (user) {
        // Önce Firestore’a yaz
        await setDoc(doc(db, "users", user.uid), { language: lang }, { merge: true });
      }

      // Başarılı olursa state güncelle
      setLanguageState(lang);
      setTranslations(LANGUAGES[lang]);
      await AsyncStorage.setItem("userLanguage", lang);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  const t = (key: string): string => key.split(".").reduce((acc: any, part: string) => acc?.[part] ?? key, translations);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
