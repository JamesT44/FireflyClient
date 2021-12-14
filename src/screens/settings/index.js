import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Divider, List } from 'react-native-paper';
import { useQueryClient } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ClearDialog,
  ConfirmDialog,
  ContentContainer,
  LogoutDialog,
} from '_components';
import {
  DARK_OPTIONS,
  INITIAL_SCREEN_OPTIONS,
  usePreferencesContext,
  useAuthContext,
  useTasksOptionsContext,
  useMessagesOptionsContext,
  useBookmarksOptionsContext,
} from '_contexts';

const SettingsScreen = ({ navigation }) => {
  const {
    preferences,
    setDarkPref,
    setInitialScreen,
  } = usePreferencesContext();
  const [darkDialogVisible, setDarkDialogVisible] = useState(false);
  const [initialDialogVisible, setInitialDialogVisible] = useState(false);
  const [clearCacheDialogVisible, setClearCacheDialogVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const queryClient = useQueryClient();
  const { clearAuth } = useAuthContext();
  const { clearPreferences } = usePreferencesContext();
  const { clearTasksOptions } = useTasksOptionsContext();
  const { clearMessagesOptions } = useMessagesOptionsContext();
  const { clearBookmarksOptions } = useBookmarksOptionsContext();

  return (
    <>
      <ContentContainer>
        <List.Section style={styles.list}>
          <List.Item
            title="Theme"
            description={preferences.darkPref}
            onPress={() => setDarkDialogVisible(true)}
          />
          <Divider />
          <List.Item
            title="Initial screen"
            description={preferences.initialScreen}
            onPress={() => setInitialDialogVisible(true)}
          />
          <Divider />
          <List.Item
            title="Clear cache"
            description="Re-download all data from server"
            onPress={() => setClearCacheDialogVisible(true)}
          />
          <Divider />
          <List.Item
            title="Logout"
            description="Clear all cached data, authentication tokens and settings"
            onPress={() => setLogoutDialogVisible(true)}
          />
          <Divider />
          <List.Item title="About" description="Firefly Client v0.1.0" />
          <Divider />
        </List.Section>
        {/* <Text>
        logout, clear cache, change pfp
      </Text> */}
      </ContentContainer>
      <ConfirmDialog
        visible={darkDialogVisible}
        value={preferences.darkPref}
        title="Theme"
        options={Object.values(DARK_OPTIONS)}
        onDismiss={() => setDarkDialogVisible(false)}
        onValueChange={setDarkPref}
      />
      <ConfirmDialog
        visible={initialDialogVisible}
        value={preferences.initialScreen}
        title="Initial Screen"
        options={Object.values(INITIAL_SCREEN_OPTIONS)}
        onDismiss={() => setInitialDialogVisible(false)}
        onValueChange={setInitialScreen}
      />
      <ClearDialog
        visible={clearCacheDialogVisible}
        onDismiss={() => setClearCacheDialogVisible(false)}
        onConfirm={async () => {
          try {
            await AsyncStorage.removeItem('firefly::tasks');
            await AsyncStorage.removeItem('firefly::tasksLastUpdated');
            queryClient.getQueryCache().clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'App' }],
            });
          } catch (err) {
            console.warn(err);
          }
        }}
      />
      <LogoutDialog
        visible={logoutDialogVisible}
        onDismiss={() => setLogoutDialogVisible(false)}
        onConfirm={async () => {
          await AsyncStorage.removeItem('firefly::tasks');
          await AsyncStorage.removeItem('firefly::tasksLastUpdated');
          queryClient.getQueryCache().clear();
          clearPreferences();
          clearTasksOptions();
          clearMessagesOptions();
          clearBookmarksOptions();
          clearAuth();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: 0,
  },
});

export default SettingsScreen;
