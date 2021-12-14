import React, { useEffect, useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  getFocusedRouteNameFromRoute,
  useTheme,
} from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import { useQueryClient } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DashboardScreen from '_screens/dashboard';
import TasksScreen from '_screens/tasks';
import MessagesScreen from '_screens/messages';
import BookmarksScreen from '_screens/bookmarks';
// import PlannerScreen from '_screens/planner';
import { HeaderButtonGroup } from '_components';
import { usePreferencesContext, useAuthContext } from '_contexts';
import { getMessages, getBookmarks } from '_api';

const Tab = createMaterialBottomTabNavigator();

const CurrentHeaderButtonGroup = (navigation, route) => {
  const currentTab = getFocusedRouteNameFromRoute(route) ?? 'Dashboard';

  switch (currentTab) {
    case 'Tasks':
      return (
        <HeaderButtonGroup.OptionsAvatar
          optionsOnPress={() => navigation.navigate('TasksOptions')}
          avatarOnPress={() => navigation.navigate('Settings')}
        />
      );
    case 'Messages':
      return (
        <HeaderButtonGroup.OptionsAvatar
          optionsOnPress={() => navigation.navigate('MessagesOptions')}
          avatarOnPress={() => navigation.navigate('Settings')}
        />
      );
    case 'Bookmarks':
      return (
        <HeaderButtonGroup.OptionsAvatar
          optionsOnPress={() => navigation.navigate('BookmarksOptions')}
          avatarOnPress={() => navigation.navigate('Settings')}
        />
      );
    case 'Planner':
      return (
        <HeaderButtonGroup.DateAvatar
          avatarOnPress={() => navigation.navigate('Settings')}
        />
      );
    default:
      return (
        <HeaderButtonGroup.RefreshAvatar
          avatarOnPress={() => navigation.navigate('Settings')}
        />
      );
  }
};

const MainNavigator = ({ navigation, route }) => {
  const { auth } = useAuthContext();
  const queryClient = useQueryClient();
  useEffect(() => {
    (async () => {
      try {
        const tasks = await AsyncStorage.getItem('firefly::tasks');
        if (tasks) {
          queryClient.setQueryData('tasks', JSON.parse(tasks));
        }
      } catch (err) {
        console.warn(err);
      }
    })();
  }, [queryClient]);
  queryClient.prefetchQuery('messages', () => getMessages(auth), {
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    cacheTime: Infinity,
  });
  queryClient.prefetchQuery('bookmarks', () => getBookmarks(auth), {
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    cacheTime: Infinity,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => CurrentHeaderButtonGroup(navigation, route),
    });
  }, [navigation, route, queryClient]);

  const { colors, dark } = useTheme();
  const { preferences } = usePreferencesContext();

  const borderColor = dark ? colors.border : colors.primary;
  const activeColor = dark ? colors.primary : colors.background;

  return (
    <Tab.Navigator
      initialRouteName={preferences.initialScreen}
      barStyle={[styles.tabBar, { borderColor }]}
      activeColor={activeColor}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Octicons name="checklist" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="message" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="bookmark" size={26} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Planner"
        component={PlannerScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="calendar-month"
              size={26}
              color={color}
            />
          ),
        }}
      /> */}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderLeftWidth: 10,
    borderRightWidth: 10,
  },
});

export default MainNavigator;
