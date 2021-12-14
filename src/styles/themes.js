import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import merge from 'deepmerge';

export const DefaultTheme = merge.all([
  PaperDefaultTheme,
  NavigationDefaultTheme,
  {
    colors: {
      primary: '#03a9f4',
      accent: '#03a9f4',
      darker: '#0079c1',
      lighter: '#67d9ff',
    },
  },
]);

export const DarkTheme = merge.all([
  PaperDarkTheme,
  NavigationDarkTheme,
  {
    colors: {
      primary: '#0a84ff',
      accent: '#0a84ff',
      darker: '#000000',
      lighter: '#67d9ff',
    },
  },
]);
