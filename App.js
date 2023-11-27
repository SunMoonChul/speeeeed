import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useRef, useEffect } from 'react';
import * as Font from 'expo-font';

import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import IpContext from './IpContext';
import AppLoading from 'expo-app-loading';
import { setCustomText } from 'react-native-global-props'; //폰트 친구

const Stack = createStackNavigator();

const loadFonts = async () => {
    //폰트
    await Font.loadAsync({
        Kingo: require('./assets/fonts/Kingo.otf'),
        Kingt: require('./assets/fonts/Kingt.ttf'),
    });
    const customTextProps = {
        style: {
            fontFamily: 'Kingt',
            fontSize: 16, // 기본 텍스트 크기도 설정할 수 있습니다.
        },
    };

    setCustomText(customTextProps);
};

export default function App() {
    const [ipRas, setIpRas] = useState('10.20.100.158');
    const [ipLap, setIpLap] = useState('10.20.102.148');
    const [ipLoc, setIpLoc] = useState('10.20.105.248');
    const [fontLoaded, setFontLoaded] = useState(false);

    if (!fontLoaded) {
        return <AppLoading startAsync={loadFonts} onFinish={() => setFontLoaded(true)} onError={console.warn} />;
    }

    return (
        <IpContext.Provider value={{ ipRas, setIpRas, ipLap, setIpLap, ipLoc, setIpLoc }}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </IpContext.Provider>
    );
}
