import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { getHostname, getTokenUrl } from '_api';
import {
  DisclaimerDialog,
  ErrorDialog,
  LoadingOverlay,
  LoginDialog,
} from '_components';
import { useAuthContext } from '_contexts';
import { useEffect } from 'react';
import { openCustomTab } from '_utils';

const LoginScreen = () => {
  const { colors } = useTheme();
  const backgroundColor = colors.primary;

  const [_isMounted, set_IsMounted] = useState(false);
  useEffect(() => {
    set_IsMounted(true);
    return () => set_IsMounted(false);
  }, []);

  const [errorVisible, setErrorVisible] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const [currCode, setCurrCode] = useState('');
  const { setHostname, auth } = useAuthContext();

  const onSubmit = useCallback(
    async (schoolCode) => {
      setLoadingVisible(true);

      try {
        const hostname = await getHostname(schoolCode);
        if (hostname === null) {
          setCurrCode(schoolCode);
          setErrorVisible(true);
          return;
        }
        console.log(`Hostname acquired: ${hostname}`);
        setHostname(hostname);

        const tokenUrl = getTokenUrl({ ...auth, hostname });
        openCustomTab(tokenUrl);
      } catch (err) {
        console.warn(err);
      } finally {
        if (_isMounted) {
          setLoadingVisible(false);
        }
      }
    },
    [setHostname, _isMounted, auth],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <DisclaimerDialog
        visible={disclaimerVisible}
        onAccept={() => setDisclaimerVisible(false)}
      />
      <LoginDialog
        visible={!errorVisible && !disclaimerVisible}
        onSubmit={onSubmit}
      />
      <ErrorDialog
        message={`School code "${currCode}" not found.`}
        visible={errorVisible}
        onDismiss={() => setErrorVisible(false)}
      />
      {loadingVisible && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default LoginScreen;
