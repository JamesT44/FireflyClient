import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from 'react-query';
import queryString from 'query-string';

import {
  AuthProvider,
  useAuthContext,
  PreferencesProvider,
  usePreferencesContext,
  TasksOptionsProvider,
  MessagesOptionsProvider,
  BookmarksOptionsProvider,
} from '_contexts';
import { DefaultTheme, DarkTheme } from '_styles';
import { StatusBar, LoadingOverlay } from '_components';
import Navigator from '_navigations';
import { verifyToken, getUserData, getProfilePic } from '_api';

const App = () => {
  const { isThemeDark, setProfilePic } = usePreferencesContext();
  const theme = isThemeDark() ? DarkTheme : DefaultTheme;
  const [loadingVisible, setLoadingVisible] = useState(false);
  const { auth, setToken, setUserData } = useAuthContext();

  const navigationRef = useRef(null);
  const [_isMounted, set_IsMounted] = useState(false);
  useEffect(() => {
    set_IsMounted(true);
    return () => set_IsMounted(false);
  }, []);

  const handleAuthUrl = useCallback(
    async (url) => {
      if (url && auth.hostname && auth.deviceId) {
        if (_isMounted) {
          setLoadingVisible(true);
        }
        const token = queryString.parseUrl(url).query.token;

        try {
          const isTokenValid = await verifyToken({ ...auth, token });
          if (isTokenValid) {
            console.log(`Token validated: ${token}`);
            const userData = await getUserData({ ...auth, token });
            const profilePic = await getProfilePic({
              ...auth,
              token,
              userData,
            });
            console.log(`User logged in: ${JSON.stringify(userData)}`);
            setUserData(userData);
            setProfilePic(profilePic);
            setToken(token);
            // navigationRef.current?.reset({
            //   index: 0,
            //   routes: [{ name: 'App' }],
            // });
          }
        } catch (err) {
          console.warn(err);
        } finally {
          if (_isMounted) {
            setLoadingVisible(false);
          }
        }
      }
    },
    [auth, setToken, setUserData, setProfilePic, _isMounted],
  );

  useEffect(() => {
    Linking.getInitialURL()
      .then(handleAuthUrl)
      .catch((err) => {
        console.warn(err);
      });
    Linking.addEventListener('url', (event) => handleAuthUrl(event.url));
  }, [handleAuthUrl, auth]);
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer ref={navigationRef} theme={theme}>
          <StatusBar />
          <Navigator />
          {loadingVisible && <LoadingOverlay />}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const queryClient = new QueryClient();
LogBox.ignoreLogs(['Setting a timer']);

const Main = () => {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <TasksOptionsProvider>
          <MessagesOptionsProvider>
            <BookmarksOptionsProvider>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </BookmarksOptionsProvider>
          </MessagesOptionsProvider>
        </TasksOptionsProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
};

export default Main;
