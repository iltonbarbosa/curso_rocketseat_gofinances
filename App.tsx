import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import React, {useEffect} from 'react';
import { StatusBar } from 'react-native';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components';
import SplashScreen from 'react-native-splash-screen';

import { Routes } from './src/routes';

import {
	useFonts,
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';

import { AuthProvider, useAuth } from './src/hooks/auth';

export default function App() {
	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_700Bold
	});

	const { userStorageLoading } = useAuth();

	useEffect(() => {
		SplashScreen.hide();
	  },[]);

	if(!fontsLoaded || userStorageLoading){
		return <AppLoading />
	}
  return (
	<ThemeProvider theme={theme}>
			<StatusBar  barStyle="light-content"/>
			<AuthProvider>
				<Routes />
			</AuthProvider>	
	</ThemeProvider>  
    
  );
}
