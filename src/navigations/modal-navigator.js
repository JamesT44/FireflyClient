import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MainNavigator from './main-navigator.js';
import TasksOptionsModal from '_screens/tasks-options';
import TaskCreateModal from '_screens/task-create';
import TaskDetailsModal from '_screens/task-details';
import MessagesOptionsModal from '_screens/messages-options';
import BookmarksOptionsModal from '_screens/bookmarks-options';
import SettingsScreen from '_screens/settings';
import { useHeaderStyle } from '_styles';

const ModalStack = createStackNavigator();

const ModalNavigator = ({ navigation, route }) => {
  const headerStyle = useHeaderStyle();

  return (
    <ModalStack.Navigator
      initialRouteName="Main"
      mode="modal"
      screenOptions={{ ...headerStyle, headerTitleAlign: 'center' }}>
      <ModalStack.Screen
        name="Main"
        component={MainNavigator}
        options={{ title: 'Firefly Client', headerTitleAlign: 'left' }}
      />
      <ModalStack.Screen
        name="TasksOptions"
        component={TasksOptionsModal}
        options={{
          title: 'Sort and Filter',
        }}
      />
      <ModalStack.Screen
        name="TaskCreate"
        component={TaskCreateModal}
        options={{
          title: 'Personal Task',
        }}
      />
      <ModalStack.Screen name="TaskDetails" component={TaskDetailsModal} />
      <ModalStack.Screen
        name="MessagesOptions"
        component={MessagesOptionsModal}
        options={{
          title: 'Sort and Filter',
        }}
      />
      <ModalStack.Screen
        name="BookmarksOptions"
        component={BookmarksOptionsModal}
        options={{
          title: 'Sort and Filter',
        }}
      />
      <ModalStack.Screen name="Settings" component={SettingsScreen} />
    </ModalStack.Navigator>
  );
};

export default ModalNavigator;
