import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button, ImageBackground, Alert, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import * as Location from 'expo-location';
import axios from 'axios';
import * as Progress from 'react-native-progress';

export default function Main() {
    const context = useContext(IpContext);

    const [speed, setSpeed] = useState(0);
    const [prevSpeed, setPrevSpeed] = useState(0); // 이전 속도
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [message, setMessage] = useState(''); // 급가속 또는 급정거 메시지
    const [cnt, setCnt] = useState(0); // 급가속 또는 급정거 횟수
    const user = 'qwer';
    const address = `http://${context.ipLap}:8000/example/`;

    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            const watchId = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000, // 위치정보 업데이트 간격 1초 안의
                    distanceInterval: 0, // 위치 변할 때마다 알림
                },
                (position) => {
                    const currentSpeed = position.coords.speed * 3.6;

                    // 속도가 1초 이내에 20km 이상 올라가면 '급가속'
                    if (currentSpeed - prevSpeed >= 10) {
                        setMessage('급가속');
                        setCnt((cnt) => cnt + 1); // 카운트 증가
                        console.log('급가속');
                        console.log(address + 'accel/');
                        // 여기에서 서버에 데이터를 전송합니다.
                        axios
                            .post(address + 'accel/', {
                                user: user,
                            })
                            .then((response) => {
                                console.log(response.data);
                                console.log('급가속 완');
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    }
                    // 속도가 1초 이내에 20km 이상 내려가면 '급정거'
                    else if (prevSpeed - currentSpeed >= 10) {
                        setMessage('급정거');
                        setCnt((cnt) => cnt + 1); // 카운트 증가
                        console.log('급정거');
                        // 여기에서 서버에 데이터를 전송합니다.
                        axios
                            .post(address + 'deccel/', {
                                user: user,
                            })
                            .then((response) => console.log(response.data))
                            .catch((error) => console.error(error));
                        console.log(address + 'deccel/');
                        console.log('급정거 완');
                    } else {
                        setMessage('');
                    }

                    setPrevSpeed(speed); // 이전 속도 업데이트
                    setSpeed(currentSpeed);
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                }
            );

            return () => watchId.remove();
        })();
    }, []);

    return (
        <View style={styles.image}>
            <View style={styles.logoview}>
                <Image source={require('./logocrop.png')} style={styles.logo}></Image>
            </View>
            <View style={styles.topview}>
                <View style={styles.kmfontview}>
                    <Text style={styles.speedfont}>현재 : </Text>
                    <Text style={styles.speedfont2}>{speed.toFixed(0)} km/h</Text>
                </View>

                <View style={styles.viewst}>
                    <TouchableOpacity
                        style={styles.topbutton}
                        onPress={() => console.log("'qwer'님이 도로를 정화시켜 준 시간")}
                    >
                        <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                            <Text style={{ justifyContent: 'flex-start', fontSize: 22 }}>
                                'qwer'님이{'\n'} 도로를 정화시켜 준 시간🏎
                            </Text>
                            <Image source={require('./icons/usericon.png')} style={{ width: 50, height: 50 }}></Image>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                flex: 0,
                                justifyContent: 'space-between',
                                width: '100%',
                                paddingVertical: 8,
                                paddingHorizontal: '2%',
                            }}
                        >
                            <Progress.Bar progress={0.2} width={200} height={15} />
                            <Text>경험치 100/100</Text>
                            {/* 경험치에 따라 레벨도 같이 증가 */}
                        </View>
                        <Text
                            style={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                paddingStart: '2%',
                                fontSize: 20,
                            }}
                        >
                            Lv.1
                            {/* 레벨 들어갈 것 */}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewst}>
                    <TouchableOpacity
                        style={styles.twinbutton}
                        onPress={() => console.log('도로 위의 무법자 신고 횟수')}
                    >
                        <Text style={{ justifyContent: 'flex-start', width: '100%', fontSize: 20 }}>
                            도로 위의{'\n'}무법자 신고 횟수
                        </Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5, alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50 }}>05</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5 }}>회</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.twinbutton}
                        onPress={() => console.log('내가 잠시 도로 위의 무법자가 되었던 횟수')}
                    >
                        <Text style={{ justifyContent: 'flex-start', width: '100%', fontSize: 18 }}>
                            내가 잠시 도로 위의 무법자가 되었던 횟수
                        </Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5, alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50 }}>05</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5 }}>회</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewst}>
                    <TouchableOpacity style={styles.reportbutton} onPress={() => console.log('신고하기')}>
                        <Image source={require('./icons/report.png')} style={{ width: 50, height: 50 }}></Image>
                        <Text style={{ fontSize: 40 }}>신고하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    topview: {
        flex: 1,
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    speedfont: {
        fontSize: 40,
    },
    speedfont2: {
        fontSize: 70,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    logo: {
        width: '40%',
        height: '30%',
    },
    logoview: {
        flex: 0.2,
        marginTop: 80,
        marginStart: 20,
    },
    topbutton: {
        flex: 0,
        alignItems: 'center',
        backgroundColor: '#E3E3E3',
        padding: 10,
        borderColor: 'black', // 테두리 색상 설정
        margin: '2%',
        width: '100%',

        borderRadius: 15,
        flexDirection: 'column', // 세로방향 배치
        justifyContent: 'space-between', // 컴포넌트들 사이의 공간 고르게 분배
    },

    reportbutton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#E3E3E3',
        padding: 10,
        borderColor: 'black', // 테두리 색상 설정
        margin: '2%',
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    twinbutton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#E3E3E3',
        padding: 10,
        borderColor: 'black', // 테두리 색상 설정
        margin: '2%',
        borderRadius: 15,
        width: '100%',
    },
    viewst: {
        margin: '2%',
        flexDirection: 'row',
    },
    kmfontview: {
        marginTop: -50,
        paddingStart: '10%',
        paddingEnd: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
    },
});
