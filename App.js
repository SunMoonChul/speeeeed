import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useRef, useEffect } from 'react';
import * as Font from 'expo-font';
import { View } from 'react-native';

import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import MainScreen from './MainScreen';
import MyInfoScreen from './MyInfoScreen';
import IpContext from './IpContext';
import TotalReportNum from './TotalReportNum';
import Sanctions from './Sanctions';
import * as SplashScreen from 'expo-splash-screen';
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

    const [id, setId] = useState('');
    const [level, setLevel] = useState('');
    const [reportcnt, setReportcnt] = useState(0);
    const [reportedcnt, setReportedcnt] = useState(0);
    const [upcnt, setUpcnt] = useState('');
    const [downcnt, setDowncnt] = useState('');
    const [numplate, setNumplate] = useState('');
    const [record, setRecord] = useState('');
    const [totRecord, setTotRecord] = useState('');
    const [ipRas, setIpRas] = useState('10.20.100.158');
    const [ipLap, setIpLap] = useState('10.20.102.157');
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync();
                await loadFonts();
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    };

    if (!appIsReady) {
        return null;
    }

    return (
        <IpContext.Provider value={{ id, setId, level, setLevel, reportcnt, setReportcnt, reportedcnt, setReportedcnt, upcnt, setUpcnt, downcnt, setDowncnt, numplate, setNumplate, record, setRecord, totRecord, setTotRecord, ipRas, setIpRas, ipLap, setIpLap }}>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        <Stack.Screen name="MyInfo" component={MyInfoScreen} />
                        <Stack.Screen name="TotalReportNum" component={TotalReportNum} />
                        <Stack.Screen name="Sanctions" component={Sanctions} />
                    </Stack.Navigator>
                </NavigationContainer>
            </View>
        </IpContext.Provider>
    );
}