import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { verifyToken } from '_api';

const AuthContext = createContext();
const INITIAL_AUTH = {
  hostname: null,
  deviceId: null,
  token: null,
  userData: null,
  loading: true,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider = (props) => {
  const [auth, setAuth] = useState(INITIAL_AUTH);

  useEffect(() => {
    (async () => {
      let savedAuth = null;
      await AsyncStorage.getItem('firefly::auth')
        .then((value) => {
          if (value) {
            savedAuth = { ...JSON.parse(value), loading: false };
          } else {
            const deviceId = uuidv4();
            setAuth({ ...INITIAL_AUTH, deviceId, loading: false });
          }
        })
        .catch((err) => console.warn(err));

      if (savedAuth && savedAuth.hostname) {
        try {
          const isTokenValid = await verifyToken(savedAuth);
          if (isTokenValid) {
            console.log(`Token validated: ${savedAuth.token}`);
            setAuth({ ...savedAuth, loading: false });
          } else {
            console.log('Token validation failed');
            const deviceId = uuidv4();
            setAuth({ ...INITIAL_AUTH, deviceId, loading: false });
          }
        } catch (err) {
          console.warn(JSON.stringify(err, null, 2));
        }
      } else {
        const deviceId = uuidv4();
        setAuth({ ...INITIAL_AUTH, deviceId, loading: false });
      }
    })();
  }, []);

  useEffect(() => {
    if (auth !== INITIAL_AUTH && !auth.loading) {
      AsyncStorage.setItem('firefly::auth', JSON.stringify(auth));
    }
  }, [auth]);

  const setToken = useCallback(
    (token) => setAuth((prevAuth) => ({ ...prevAuth, token })),
    [setAuth],
  );

  const setHostname = useCallback(
    (hostname) => setAuth((prevAuth) => ({ ...prevAuth, hostname })),
    [setAuth],
  );

  const setUserData = useCallback(
    (userData) => setAuth((prevAuth) => ({ ...prevAuth, userData })),
    [setAuth],
  );

  const clearAuth = useCallback(() => {
    const newAuth = { ...INITIAL_AUTH, deviceId: uuidv4(), loading: false };
    setAuth(newAuth);
    AsyncStorage.setItem('firefly::auth', JSON.stringify(newAuth));
  }, [setAuth]);

  const value = useMemo(
    () => ({
      auth,
      setToken,
      setHostname,
      setUserData,
      clearAuth,
    }),
    [auth, setToken, setHostname, setUserData, clearAuth],
  );

  return <AuthContext.Provider value={value} {...props} />;
};
