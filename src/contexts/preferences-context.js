import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PreferencesContext = createContext();

export const DARK_OPTIONS = {
  system: 'System default',
  light: 'Light',
  dark: 'Dark',
};
export const INITIAL_SCREEN_OPTIONS = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  messages: 'Messages',
  bookmarks: 'Bookmarks',
};

Object.freeze(DARK_OPTIONS);
Object.freeze(INITIAL_SCREEN_OPTIONS);

const INITIAL_PREFERENCES = {
  darkPref: DARK_OPTIONS.system,
  initialScreen: INITIAL_SCREEN_OPTIONS.dashboard,
  profilePic: null,
};

export const usePreferencesContext = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = (props) => {
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const colorScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem('firefly::preferences').then((value) => {
      if (value) {
        setPreferences(JSON.parse(value));
      }
    });
  }, []);

  useEffect(() => {
    if (preferences !== INITIAL_PREFERENCES) {
      AsyncStorage.setItem('firefly::preferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  const isThemeDark = useCallback(() => {
    switch (preferences.darkPref) {
      case DARK_OPTIONS.dark:
        return true;
      case DARK_OPTIONS.light:
        return false;
      default:
        return colorScheme === 'dark';
    }
  }, [preferences, colorScheme]);

  const setDarkPref = useCallback(
    (darkPref) =>
      setPreferences((prevPreferences) => ({ ...prevPreferences, darkPref })),
    [setPreferences],
  );

  const setInitialScreen = useCallback(
    (initialScreen) =>
      setPreferences((prevPreferences) => ({
        ...prevPreferences,
        initialScreen,
      })),
    [setPreferences],
  );

  const setProfilePic = useCallback(
    (profilePic) =>
      setPreferences((prevPreferences) => ({ ...prevPreferences, profilePic })),
    [setPreferences],
  );

  const clearPreferences = useCallback(() => {
    setPreferences(INITIAL_PREFERENCES);
    AsyncStorage.setItem(
      'firefly::preferences',
      JSON.stringify(INITIAL_PREFERENCES),
    );
  }, [setPreferences]);

  const value = useMemo(
    () => ({
      preferences,
      isThemeDark,
      setDarkPref,
      setInitialScreen,
      setProfilePic,
      clearPreferences,
    }),
    [
      preferences,
      isThemeDark,
      setDarkPref,
      setInitialScreen,
      setProfilePic,
      clearPreferences,
    ],
  );

  return <PreferencesContext.Provider value={value} {...props} />;
};
