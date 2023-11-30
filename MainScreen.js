import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Alert, Image, SafeAreaView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import * as Location from 'expo-location';
import axios from 'axios';
import { pickVideoFromGallery } from './Select_Video';
import * as Progress from 'react-native-progress';
import Swiper from 'react-native-swiper';
import { pickVideoFromGallery } from './Select_Video';

export default function Main() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const context = useContext(IpContext);

    const [speed, setSpeed] = useState(0);
    const [prevSpeed, setPrevSpeed] = useState(0); // 이전 속도
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [message, setMessage] = useState(''); // 급가속 또는 급정거 메시지
    const [cnt, setCnt] = useState(0); // 급가속 또는 급정거 횟수
    const user = '222부8327';

    const navigation = useNavigation();

    const gotoMyInfo = () => {
        console.log(`${context.numplate}님이 도로를 정화시켜 준 시간`);
        navigation.navigate('MyInfo');
    };

<<<<<<< HEAD
=======
    const gotoMyFail = () => {
        console.log('내가 잠시 도로 위의 무법자가 되었던 횟수');
        navigation.navigate('Sanctions');
    };

    const today = new Date(); //오늘시간
    const currentTimems = Date.now(); // 현재 시간 (밀리초)
    const currenttime =
        today.getFullYear() +
        '/' +
        (today.getMonth() + 1) +
        '/' +
        today.getDate() +
        '_' +
        today.getHours() +
        ':' +
        today.getMinutes() +
        ':' +
        today.getSeconds();

    const [isOverSpeed, setIsOverSpeed] = useState(false); // 과속 상태를 저장하는 상태 변수
    const [lastActionTime, setLastActionTime] = useState(0); // 마지막으로 동작한 시점 (밀리초)

>>>>>>> origin/gitmaster
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
                    const currentSpeed = (position.coords.speed || 0) * 3.6;

                    // 속도가 1초 이내에 20km 이상 올라가면 '급가속'
                    if (currentSpeed - prevSpeed >= 20 && currentTimems - lastActionTime >= 10000) {
                        setCnt((cnt) => cnt + 1); // 카운트 증가
                        console.log('급가속');
                        console.log(`http://${context.ipLap}:3003/accel`);

                        setLastActionTime(currentTimems); // 마지막 동작 시간 갱신

                        // 여기에서 서버에 데이터를 전송합니다.
                        axios
                            .post(`http://${context.ipLap}:3003/accel`, {
                                user: user,
                                time: currenttime,
                                accel: 0,
                            })
                            .then((response) => {
                                console.log(response.data);
                                console.log('급가속 완');
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    }
                    // 속도가 1초 이내에 20km 이상 내려가면 '급감속'
                    else if (prevSpeed - currentSpeed >= 20 && currentTimems - lastActionTime >= 10000) {
                        setCnt((cnt) => cnt + 1); // 카운트 증가
                        console.log('급감속');
                        console.log(`http://${context.ipLap}:3003/accel`);

                        setLastActionTime(currentTimems); // 마지막 동작 시간 갱신

                        // 여기에서 서버에 데이터를 전송합니다.
                        axios
                            .post(`http://${context.ipLap}:3003/accel`, {
                                user: user,
                                time: currenttime,
                                accel: 1,
                            })
                            .then((response) => {
                                console.log(response.data);
                                console.log('급감속 완');
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    } else {
                        setMessage('');
                    }
                    // 과속 2
                    if (currentSpeed > 110) {
                        if (!isOverSpeed) {
                            // 과속 상태가 아닐 때만 실행
                            setIsOverSpeed(true); // 과속 상태로 설정

                            // 5초 후에 과속 상태를 해제
                            setTimeout(() => {
                                setIsOverSpeed(false);
                            }, 5000);

                            setCnt((cnt) => cnt + 1); // 카운트 증가
                            console.log('과속');
                            console.log(`http://${context.ipLap}:3003/accel`);

                            // 과속 상태일 때만 서버에 데이터를 전송
                            axios
                                .post(`http://${context.ipLap}:3003/accel`, {
                                    user: user,
                                    time: currenttime,
                                    accel: 2,
                                })
                                .then((response) => {
                                    console.log(response.data);
                                    console.log('과속 완');
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        }
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
        <SafeAreaView style={styles.image}>
            <View style={styles.logoview}>
                <Image source={require('./assets/logocrop.png')} style={styles.logo}></Image>
            </View>
            <View style={styles.topview}>
                <View style={styles.kmfontview}>
                    <Text style={styles.speedfont2}>{Math.max(0, speed).toFixed(0)} km/h</Text>
                </View>

                <View style={styles.viewst}>
                    <TouchableOpacity style={styles.topbutton} onPress={gotoMyInfo}>
                        <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                            <Text style={{ justifyContent: 'flex-start', fontSize: 22, fontFamily: 'Kingt' }}>
<<<<<<< HEAD
                                '<Text style={{ color: '#3b5998' }}>{context.numplate}</Text>'님이{'\n'} 도로를 정화시켜 준 시간🏎
=======
                                '<Text style={{ color: '#3b5998' }}>{context.numplate}</Text>'님이{'\n'} 도로를 정화시켜
                                준 시간🌈
>>>>>>> origin/gitmaster
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
                            <View style={{ height: 10 }}>
<<<<<<< HEAD
                                <Progress.Bar progress={context.record / (context.level * 100)} width={250} height={15} color={'#3b5998'} />
                            </View>
                            <Text style={{ fontFamily: 'Kingt' }}>{context.record}/{context.level * 100}</Text>
=======
                                <Progress.Bar
                                    progress={(context.record || 0) / ((context.level || 1) * 100)}
                                    width={250}
                                    height={15}
                                    color={'#3b5998'}
                                />
                            </View>
                            <Text style={{ fontFamily: 'Kingt' }}>
                                {context.record}/{context.level * 100}
                            </Text>
>>>>>>> origin/gitmaster
                            {/* 경험치에 따라 레벨도 같이 증가 */}
                        </View>
                        <Text
                            style={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                paddingStart: '2%',
                                fontSize: 20,
                                fontFamily: 'Kingt',
                            }}
                        >
                            Lv.{context.level}
                            {/* 레벨 들어갈 것 */}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewst}>
<<<<<<< HEAD
                    <TouchableOpacity
                        style={styles.twinbutton}
                        onPress = {() => navigation.navigate('TotalReportNum')}
                    >
                        <Text
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 17, fontFamily: 'Kingt' }}
                        >
                            신고 횟수
=======
                    <TouchableOpacity style={styles.twinbutton} onPress={() => navigation.navigate('TotalReportNum')}>
                        <Text
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 17, fontFamily: 'Kingt' }}
                        >
                            신고 횟수{'\n'}
>>>>>>> origin/gitmaster
                        </Text>
                        <Text style={{ color: '#BFBFBF' }}>───────────</Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50, fontFamily: 'Kingt', color: '#3b5998' }}>05</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5, fontFamily: 'Kingt' }}>
                                회
                            </Text>
                        </View>
                    </TouchableOpacity>
<<<<<<< HEAD
                    <TouchableOpacity
                        style={styles.twinbutton}
                        onPress={() => navigation.navigate('Sanctions')}
                    >
=======
                    <TouchableOpacity style={styles.twinbutton} onPress={gotoMyFail}>
>>>>>>> origin/gitmaster
                        <Text
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 17, fontFamily: 'Kingt' }}
                        >
                            신고당한 횟수{'\n'}
                        </Text>
                        <Text style={{ color: '#BFBFBF' }}>───────────</Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50, fontFamily: 'Kingt', color: '#3b5998' }}>05</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5, fontFamily: 'Kingt' }}>
                                회
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewst}>
                    <TouchableOpacity style={styles.reportbutton} onPress={pickVideoFromGallery}>
                        <Image source={require('./icons/report.png')} style={{ width: 50, height: 50 }}></Image>
                        <Text style={{ fontSize: 40, fontFamily: 'Kingt' }}>제보하기</Text>
                    </TouchableOpacity>
                </View>
                {/* 광고 배너 */}
                <View style={styles.addview}>
                    <Swiper
                        height={500}
                        horizontal={true}
                        autoplay
                        loop
                        spaceBetween={100}
                        paginationStyle={{ top: '90%', left: '80%' }}
                        dotColor={'#3b5998'}
                    >
                        <ImageBackground
                            source={require('./assets/sw.jpg')}
                            imageStyle={{ borderRadius: 15 }}
                            style={{ flex: 1, height: 120, width: '100%' }}
                        >
                            <Text style={styles.addtext}>안전운행하면{'\n'}복이 온다굿</Text>
                        </ImageBackground>

                        <ImageBackground
                            source={require('./assets/theedge.jpg')}
                            imageStyle={{ borderRadius: 15 }}
                            // {/* zIndex 는 요소의 레이어 순서를 제어하는 것이고 값이 높을 수록 화면 위쪽에 표시 */}
                            style={{ flex: 1, height: 120, width: '100%' }}
                        >
                            <Text style={styles.addtext}>쏘나타 신형{'\n'}진짜 존나 비싸다.</Text>
                        </ImageBackground>

                        <ImageBackground
                            source={require('./assets/gv70.jpg')}
                            imageStyle={{ borderRadius: 15 }}
                            style={{ flex: 1, height: 120, width: '100%' }}
                        >
                            <Text style={styles.addtext}>나 이거좀 사줘라{'\n'}국민 406602 04 222066</Text>
                        </ImageBackground>
                    </Swiper>
                </View>
            </View>
        </SafeAreaView>
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
        fontFamily: 'Kingt',
    },
    speedfont2: {
        fontSize: 60,
        fontFamily: 'Kingt',
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        backgroundColor: '#F2F2F2',
    },
    logo: {
        width: '40%',
        height: '30%',
    },
    logoview: {
        flex: 0.2,
        marginStart: 20,
        marginTop: 5,
    },
    topbutton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#E3E3E3',
        padding: 10,
        borderColor: 'black', // 테두리 색상 설정
        margin: '2%',
        width: '100%',
        borderRadius: 15,
        flexDirection: 'column', // 세로방향 배치
        justifyContent: 'space-between', // 컴포넌트들 사이의 공간 고르게 분배
        borderWidth: 1,
        borderColor: '#BFBFBF',
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
        borderWidth: 1,
        borderColor: '#BFBFBF',
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
        borderWidth: 1,
        borderColor: '#BFBFBF',
    },
    viewst: {
        margin: '2%',
        flexDirection: 'row',
        marginVertical: '-0.5%',
    },
    addview: {
        marginTop: 20,
        margin: '2%',
        marginHorizontal: '5%',
        flex: 1,
        height: 100,
        borderRadius: 15,
    },
    kmfontview: {
<<<<<<< HEAD
        marginTop: -90,
=======
        marginTop: -70,
>>>>>>> origin/gitmaster
        paddingStart: '10%',
        paddingEnd: '5%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        width: '100%',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 1,
    },
    addtext: {
        fontFamily: 'Kingt',
        padding: 5,
        margin: 10,
        fontWeight: 'bold',
        fontSize: 17,
    },
});