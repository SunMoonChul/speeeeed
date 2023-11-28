import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useRef, useEffect } from 'react';
import * as Font from 'expo-font';

import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import MainScreen from './MainScreen';
import MyInfoScreen from './MyInfoScreen';
import IpContext from './IpContext';
import TotalReportNum from './TotalReportNum';
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

  const [reportcnt, setReportcnt] = useState('');
  const [upcnt, setUpcnt] = useState('');
  const [downcnt, setDowncnt] = useState('');
  const [numplate, setNumplate] = useState('');
  const [record, setRecord] = useState('');
  const [ipRas, setIpRas] = useState('10.20.100.158');
  const [ipLap, setIpLap] = useState('10.20.102.157');
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return <AppLoading startAsync={loadFonts} onFinish={() => setFontLoaded(true)} onError={console.warn} />;
  }

  return (
    <IpContext.Provider value={{ reportcnt, setReportcnt, upcnt, setUpcnt, downcnt, setDowncnt, numplate, setNumplate, record, setRecord, ipRas, setIpRas, ipLap, setIpLap}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="SignUp" component={SignUpScreen}/>
          <Stack.Screen name="MyInfo" component={MyInfoScreen}/>
          <Stack.Screen name="TotalReportNum" component={TotalReportNum}/>
        </Stack.Navigator>
      </NavigationContainer>
    </IpContext.Provider>
  );
}
