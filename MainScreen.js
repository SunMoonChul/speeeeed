import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Alert, Image, SafeAreaView, LogBox } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import * as Location from 'expo-location';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import Swiper from 'react-native-swiper';

export default function Main() {
    LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const context = useContext(IpContext);

    const [speed, setSpeed] = useState(0); //속도
    const [prevSpeed, setPrevSpeed] = useState(0); // 이전 속도
    const [latitude, setLatitude] = useState(null); //위도 경도
    const [longitude, setLongitude] = useState(null);

    const navigation = useNavigation(); //이동기

    const gotoMyInfo = () => {
        navigation.navigate('MyInfo');
    };

    const gotoMyFail = () => {
        navigation.navigate('Sanctions');
    };

    //영상 전송 로딩
    const handlePress = () => {
        navigation.navigate('PickVideo');
    };

    const today = new Date(); //오늘시간
    const currenttime = //년월일시간분초
        today.getFullYear() +
        '/' +
        (today.getMonth() + 1) +
        '/' +
        today.getDate() +
        ' ' +
        today.getHours() +
        ':' +
        today.getMinutes() +
        ':' +
        today.getSeconds();

    const [isOverSpeed, setIsOverSpeed] = useState(false); // 과속 상태를 저장하는 상태 변수
    const [lastActionTime, setLastActionTime] = useState(0); // 마지막으로 동작한 시점 (밀리초)
    const [isRapid, setIsRapid] = useState(false); // 급가속, 급감속, 과속 상태

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    axios
                        .post(`http://${context.ipLap}:3003/main`, {
                            numplate: context.numplate,
                        })
                        .then((response) => {
                            console.log(response.data);
                            context.setReportCnt(response.data.reportCnt);
                            context.setReportedCnt(response.data.reportedCnt);
                            context.setTotRecord(response.data.totRecord);
                            let newTotRecord = response.data.totRecord;
                            let level = parseInt(newTotRecord / 100 + 1);
                            context.setLevel(level);
                            context.setRecord(newTotRecord - ((level - 1) * 100));
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } catch (error) {
                    console.error('There was an error!', error);
                }
            };
            fetchData();

            // ... 기존 코드 ...
        }, []) // 의존성 배열에 필요한 변수를 추가하세요.
    );

    useEffect(() => {
        if (isRapid) {
            const timer = setTimeout(() => {
                setIsRapid(false); // 상태 초기화
            }, 2000); // 1초 후에 색상이 원래대로 돌아갑니다.

            return () => clearTimeout(timer);
        }
        (async () => {
            //위치 권한
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let prevSpeed = 0; // 초기 이전 속도

            const watchId = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High, //정확도 민감
                    timeInterval: 1000, // 위치정보 업데이트 간격 1초 안의
                    distanceInterval: 0, // 위치 변할 때마다 알림
                },
                (position) => {
                    const currentSpeed = (position.coords.speed || 0) * 3.6;
                    const currentTimems = Date.now(); // 현재 시간 (밀리초)

                    // 현재 속도와 시간을 업데이트
                    setSpeed(currentSpeed);
                    if (currentSpeed >= 0) {
                        // 속도가 1초 이내에 20km 이상 올라가면 '급가속'
                        if (currentSpeed - prevSpeed >= 20 && currentTimems - lastActionTime >= 10000) {
                            // console.log('급가속 ' + 'cs : ' + currentSpeed + ',ps : ' + prevSpeed);
                            setIsRapid(true);

                            // 여기에서 서버에 데이터를 전송합니다.
                            axios
                                .post(`http://${context.ipLap}:3003/accel`, {
                                    user: context.numplate,
                                    time: currenttime,
                                    latitude: latitude ? latitude.toFixed(6) : null,
                                    longitude: longitude ? longitude.toFixed(6) : null,
                                    accel: 0,
                                    record: context.totRecord,
                                })
                                .then((response) => {
                                    console.log('급가속 완' + response.data);
                                    // 마지막 동작 시간 갱신
                                    setLastActionTime(currentTimems);
                                    console.log(currenttime);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    // 마지막 동작 시간 갱신
                                    setLastActionTime(currentTimems);
                                });
                        }
                        // 속도가 1초 이내에 20km 이상 내려가면 '급감속'
                        else if (prevSpeed - currentSpeed >= 20 && currentTimems - lastActionTime >= 10000) {
                            // console.log('급감속 ' + 'cs : ' + currentSpeed + ',ps : ' + prevSpeed);
                            setIsRapid(true);

                            // 여기에서 서버에 데이터를 전송합니다.
                            axios
                                .post(`http://${context.ipLap}:3003/accel`, {
                                    user: context.numplate,
                                    time: currenttime,
                                    latitude: latitude ? latitude.toFixed(6) : null,
                                    longitude: longitude ? longitude.toFixed(6) : null,
                                    accel: 1,
                                    record: context.totRecord,
                                })
                                .then((response) => {
                                    console.log('급감속 완 ' + response.data);
                                    // 마지막 동작 시간 갱신
                                    setLastActionTime(currentTimems);
                                    console.log(currenttime);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    // 마지막 동작 시간 갱신
                                    setLastActionTime(currentTimems);
                                });
                        }
                        // 과속 - 2로 표시
                        if (currentSpeed > 110) {
                            setIsRapid(true);
                            if (!isOverSpeed) {
                                // 과속 상태가 아닐 때만 실행
                                setIsOverSpeed(true); // 과속 상태로 설정

                                // 5초 후에 과속 상태를 해제
                                setTimeout(() => {
                                    setIsOverSpeed(false);
                                }, 5000);

                                // 과속 상태일 때만 서버에 데이터를 전송
                                axios
                                    .post(`http://${context.ipLap}:3003/accel`, {
                                        user: context.numplate,
                                        time: currenttime,
                                        latitude: latitude ? latitude.toFixed(6) : null,
                                        longitude: longitude ? longitude.toFixed(6) : null,
                                        accel: 2,
                                        record: context.totRecord,
                                    })
                                    .then((response) => {
                                        context.setTotRecord = response.data.newTotRecord;
                                        let totRecord = response.data.newTotRecord;
                                        let level = parseInt(totRecord / 100 + 1);
                                        context.setLevel(level);
                                        context.setRecord(totRecord - ((level - 1) * 100));
                                        console.log('과속 완' + response.data);
                                        // 마지막 동작 시간 갱신
                                        setLastActionTime(currentTimems);
                                        console.log(currenttime);
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        // 마지막 동작 시간 갱신
                                        setLastActionTime(currentTimems);
                                    });
                            }
                        }
                    }
                    setPrevSpeed(speed); // 이전 속도 업데이트
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                }
            );

            return () => watchId.remove();
        })();
    }, [isRapid]);

    return (
        <SafeAreaView style={styles.image}>
            <View style={styles.logoview}>
                <Image source={require('./assets/logocrop.png')} style={styles.logo}></Image>
            </View>
            <View style={styles.topview}>
                <View style={styles.kmfontview}>
                    {/* <View>
                        {latitude && <Text style={{ fontSize: 10 }}>위도: {latitude.toFixed(6)}</Text>}
                        {longitude && <Text style={{ fontSize: 10 }}>경도: {longitude.toFixed(6)}</Text>}
                    </View> */}
                    <Text style={[styles.speedfont2, isRapid ? { color: 'red' } : {}]}>
                        {Math.max(0, speed).toFixed(0)} km/h
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
                                    progress={(context.record || 0) / 100}
                                    width={250}
                                    height={15}
                                    color={'#3b5998'}
                                />
                            </View>
                            <Text style={{ fontFamily: 'Kingt' }}>
                                {context.record}/100
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
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 18, fontFamily: 'Kingt' }}
                        >
                            신고 횟수
                        </Text>
                        <Text style={{ color: '#BFBFBF' }}>─────────</Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50, fontFamily: 'Kingt', color: '#3b5998' }}>{context.reportCnt}</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5, fontFamily: 'Kingt' }}>
                                회
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.twinbutton} onPress={gotoMyFail}>
                        <Text
                            style={{ justifyContent: 'flex-start', width: '100%', fontSize: 18, fontFamily: 'Kingt' }}
                        >
                            신고당한 횟수
                        </Text>
                        <Text style={{ color: '#BFBFBF' }}>──────────</Text>
                        {/* 이거 디비에서 끌고와서 바뀌게 해야함 */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 50, fontFamily: 'Kingt', color: '#3b5998' }}>{context.reportedCnt}</Text>
                            <Text style={{ fontSize: 30, marginStart: 20, marginBottom: 5, fontFamily: 'Kingt' }}>
                                회
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewst}>
                    <TouchableOpacity style={styles.reportbutton} onPress={() => navigation.navigate('PickVideo')}>
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
