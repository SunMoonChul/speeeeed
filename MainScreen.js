import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
    Image,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import * as Location from 'expo-location';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import Swiper from 'react-native-swiper';
import { pickVideoFromGallery } from './Select_Video';

export default function Main() {
    const [fontsLoaded, setFontsLoaded] = useState(false); //폰트
    const context = useContext(IpContext); //그 ip 보관소
    const [isLoading, setIsLoading] = useState(false); //영상 전송 로딩

    const [latitude, setLatitude] = useState(null); //위도 경도
    const [longitude, setLongitude] = useState(null);

    const [speed, setSpeed] = useState(0);
    const [overSpeedCount, setOverSpeedCount] = useState(0); //과속
    const overSpeedTriggerTime = useRef(null);

    const [prevSpeed, setPrevSpeed] = useState(0); //현재 속도
    const [accelerationCount, setAccelerationCount] = useState(0); //급가속
    const [decelerationCount, setDecelerationCount] = useState(0); //급감속
    const accelerationTriggerTime = useRef(null);
    const decelerationTriggerTime = useRef(null);

    const navigation = useNavigation(); //이동기

    const gotoMyInfo = () => {
        navigation.navigate('MyInfo');
    };

    const gotoMyFail = () => {
        navigation.navigate('Sanctions');
    };

    //영상 전송 로딩
    const handlePress = async () => {
        setIsLoading(true);
        await pickVideoFromGallery();
        setIsLoading(false);
    };

    const [isRapid, setIsRapid] = useState(false); // 급가속, 급감속, 과속 상태

    useEffect(() => {
        if (isRapid) {
            //상태변환
            const timer = setTimeout(() => {
                setIsRapid(false); // 상태 초기화
            }, 1000); // 1초 후에 색상이 원래대로 돌아갑니다.

            return () => clearTimeout(timer);
        }
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync(); //위치 권한 묻기
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            await Location.watchPositionAsync(
                {
                    // High, Highest, BestForNavigation 10m, 가장 높은, 네비 전용 정확도 ios 전용
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000, // 위치를 얻는 간격을 1초로 설정
                    distanceInterval: 0, // 최소 이동 거리를 0m로 설정
                },
                async (location) => {
                    const currentSpeed = location.coords.speed * 3.6; // 현재 속도를 km/h 단위로 변환
                    setSpeed(Math.floor(currentSpeed)); //속도, 위도, 경도 받아옴
                    setLatitude(location.coords.latitude);
                    setLongitude(location.coords.longitude);

                    const today = new Date(); //오늘시간
                    const currenttime = //년월일시간분초
                        today.getFullYear() +
                        '-' +
                        (today.getMonth() + 1).toString().padStart(2, '0') +
                        '-' +
                        today.getDate().toString().padStart(2, '0') +
                        ' ' +
                        today.getHours().toString().padStart(2, '0') +
                        ':' +
                        today.getMinutes().toString().padStart(2, '0') +
                        ':' +
                        today.getSeconds().toString().padStart(2, '0');

                    // 과속 상태일 때만 서버에 데이터를 전송 accel : 2
                    if (currentSpeed > 110) {
                        // 현재 속도가 110km/h 이상일 경
                        if (!overSpeedTriggerTime.current) {
                            // 과속 시작 시간이 없으면 현재 시간을 저장
                            overSpeedTriggerTime.current = Date.now();
                            setIsRapid(true);
                        } else if (Date.now() - overSpeedTriggerTime.current >= 1000) {
                            //10초동안 과속하면 으락캬 됨
                            // 과속 시작 후 10초가 지났으면 카운트
                            setOverSpeedCount((prev) => prev + 1);
                            let addresses = await Location.reverseGeocodeAsync({
                                //역지오코딩
                                latitude: Number(location.coords.latitude.toFixed(6)),
                                longitude: Number(location.coords.longitude.toFixed(6)),
                            });
                            // 과속 상태일 때만 서버에 데이터를 전송
                            if (addresses.length > 0) {
                                let address = addresses[0].region + ' ' + addresses[0].city + ' ' + addresses[0].street;
                                axios
                                    .post(`http://${context.ipLap}:3003/accel`, {
                                        user: context.numplate,
                                        time: currenttime,
                                        latitude: location.coords.latitude.toFixed(6),
                                        longitude: location.coords.longitude.toFixed(6),
                                        address: address,
                                        accel: 2,
                                    })
                                    .then((response) => {
                                        console.log('과속 완' + response.data);
                                        // 마지막 동작 시간 갱신
                                        console.log(currenttime);
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        // 마지막 동작 시간 갱신
                                    });
                            } else {
                                console.log('Could not find address information for the given coordinates');
                            }
                            overSpeedTriggerTime.current = null; // 과속 시작 시간 초기화
                        }
                    } else {
                        overSpeedTriggerTime.current = null; // 속도가 120km/h 이하로 떨어지면 과속 시작 시간 초기화
                    }
                    // 급가속 감지 accel : 0
                    if (currentSpeed - prevSpeed > 20 && !accelerationTriggerTime.current) {
                        accelerationTriggerTime.current = Date.now();
                        setAccelerationCount((prev) => prev + 1);
                        setIsRapid(true);
                        // 여기에서 서버에 데이터를 전송합니다.
                        let addresses = await Location.reverseGeocodeAsync({
                            latitude: Number(location.coords.latitude.toFixed(6)),
                            longitude: Number(location.coords.longitude.toFixed(6)),
                        });
                        if (addresses.length > 0) {
                            let address = addresses[0].region + ' ' + addresses[0].city + ' ' + addresses[0].street;
                            axios
                                .post(`http://${context.ipLap}:3003/accel`, {
                                    user: context.numplate,
                                    time: currenttime,
                                    latitude: location.coords.latitude.toFixed(6),
                                    longitude: location.coords.longitude.toFixed(6),
                                    address: address,
                                    accel: 0,
                                })
                                .then((response) => {
                                    console.log('급가속 완' + response.data);
                                    // 마지막 동작 시간 갱신
                                    console.log(currenttime);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    // 마지막 동작 시간 갱신
                                });
                        } else {
                            console.log('Could not find address information for the given coordinates');
                        }
                    }

                    // 급감속 감지 accel : 1
                    if (
                        prevSpeed - currentSpeed > 20 &&
                        currentSpeed - prevSpeed >= 0 &&
                        !decelerationTriggerTime.current
                    ) {
                        decelerationTriggerTime.current = Date.now();
                        setDecelerationCount((prev) => prev + 1);
                        setIsRapid(true);
                        // 여기에서 서버에 데이터를 전송합니다.
                        let addresses = await Location.reverseGeocodeAsync({
                            latitude: Number(location.coords.latitude.toFixed(6)),
                            longitude: Number(location.coords.longitude.toFixed(6)),
                        });
                        if (addresses.length > 0) {
                            let address = addresses[0].region + ' ' + addresses[0].city + ' ' + addresses[0].street;

                            axios
                                .post(`http://${context.ipLap}:3003/accel`, {
                                    user: context.numplate,
                                    time: currenttime,
                                    latitude: location.coords.latitude.toFixed(6),
                                    longitude: location.coords.longitude.toFixed(6),
                                    address: address,
                                    accel: 1,
                                })
                                .then((response) => {
                                    console.log('급감속 완 ' + response.data);
                                    // 마지막 동작 시간 갱신
                                    console.log(currenttime);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    // 마지막 동작 시간 갱신
                                });
                        } else {
                            console.log('Could not find address information for the given coordinates');
                        }
                    }

                    // 급가속, 급감속 쿨다운 타임 처리
                    if (accelerationTriggerTime.current && Date.now() - accelerationTriggerTime.current >= 5000) {
                        accelerationTriggerTime.current = null;
                    }
                    if (decelerationTriggerTime.current && Date.now() - decelerationTriggerTime.current >= 5000) {
                        decelerationTriggerTime.current = null;
                    }

                    setPrevSpeed(currentSpeed);
                }
            );
        })();
    }, [isRapid]); //useEffect의 두번째 인자 얘가 바뀔때마다 재실행됨 내부가

    return (
        <SafeAreaView style={styles.image}>
            <View style={styles.logoview}>
                <Image source={require('./assets/logocrop.png')} style={styles.logo}></Image>
            </View>
            <View style={styles.topview}>
                <View style={styles.kmfontview}>
                    <View>
                        {latitude && <Text style={{ fontSize: 14 }}>위도: {latitude.toFixed(6)}</Text>}
                        {longitude && <Text style={{ fontSize: 14 }}>경도: {longitude.toFixed(6)}</Text>}
                        <Text style={{ fontSize: 14 }}>과속 횟수: {overSpeedCount}</Text>
                        <Text style={{ fontSize: 14 }}>급가속 횟수: {accelerationCount}</Text>
                        <Text style={{ fontSize: 14 }}>급감속 횟수: {decelerationCount}</Text>
                    </View>
                    <Text style={[styles.speedfont2, isRapid ? { color: 'red' } : {}]}>
                        {Math.max(0, speed).toFixed(0)}km/h
                        {/* {Math.max(0, speed).toFixed(0).padStart(3, '0')}km/h */}
                    </Text>
                </View>
                <View style={styles.viewst}>
                    <TouchableOpacity style={styles.topbutton} onPress={gotoMyInfo}>
                        <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                            <Text style={{ justifyContent: 'flex-start', fontSize: 22, fontFamily: 'Kingt' }}>
                                '<Text style={{ color: '#3b5998' }}>{context.numplate}</Text>'님이{'\n'} 도로를 정화시켜
                                준 시간🌈
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
                    <TouchableOpacity style={styles.twinbutton} onPress={() => navigation.navigate('TotalReportNum')}>
                        <Text
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 17, fontFamily: 'Kingt' }}
                        >
                            신고 횟수{'\n'}
                        </Text>
                        <Text style={{ color: '#BFBFBF' }}>───────────</Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50, fontFamily: 'Kingt', color: '#3b5998' }}>005</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5, fontFamily: 'Kingt' }}>
                                회
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.twinbutton} onPress={gotoMyFail}>
                        <Text
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 17, fontFamily: 'Kingt' }}
                        >
                            신고당한 횟수{'\n'}
                        </Text>
                        <Text style={{ color: '#BFBFBF' }}>───────────</Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50, fontFamily: 'Kingt', color: '#3b5998' }}>005</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5, fontFamily: 'Kingt' }}>
                                회
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewst}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity style={styles.reportbutton} onPress={handlePress}>
                            <Image source={require('./icons/report.png')} style={{ width: 50, height: 50 }}></Image>
                            <Text style={{ fontSize: 40, fontFamily: 'Kingt' }}>제보하기</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* 광고 배너 */}
                <View style={styles.addview}>
                    <Swiper
                        height={500}
                        horizontal={true}
                        autoplay
                        loop
                        spaceBetween={100}
                        paginationStyle={{ top: '85%', left: '80%' }}
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
        fontSize: 70,
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
        paddingBottom: -10,
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
        marginTop: -70,
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
