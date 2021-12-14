import React from 'react';
// import { BackHandler } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
// import { useNetInfo } from '@react-native-community/netinfo';

import ModalNavigator from './modal-navigator';
import LoginScreen from '_screens/login';
import SplashScreen from '_screens/splash';
import { useAuthContext } from '_contexts';
// import { ErrorDialog } from '_components';

const RootStack = createStackNavigator();

const RootNavigator = () => {
  const { auth } = useAuthContext();
  // const netInfo = useNetInfo();

  // if (!netInfo.isInternetReachable) {
  //   return (
  //     <ErrorDialog
  //       message={'No network connection.'}
  //       visible={true}
  //       onDismiss={() => BackHandler.exitApp()}
  //     />
  //   );
  // }
  if (auth.loading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {auth.token ? (
        <RootStack.Screen name="App" component={ModalNavigator} />
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
