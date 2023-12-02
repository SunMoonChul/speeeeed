import React, { useState, useEffect, useContext } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Image,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import axios from 'axios';
import * as Progress from 'react-native-progress';

import * as Location from 'expo-location';

export default function MyInfo() {
    const context = useContext(IpContext);
    const [post, setPost] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchMyInfo = async () => {
            try {
                const response = await axios.post(`http://${context.ipLap}:3003/myInfo`, {
                    numplate: context.numplate,
                });

                if (response.data.success) {
                    console.log('item: ', response.data.item);

                    const itemsWithAddress = await Promise.all(
                        response.data.item
                            .filter((item) => item.latitude != null && item.longitude != null) // latitude와 longitude가 null이 아닌 아이템만 필터링
                            .map(async (item) => {
                                const latitude = Number(item.latitude); // 문자열을 숫자로 변환
                                const longitude = Number(item.longitude); // 문자열을 숫자로 변환
                                const addresses = await Location.reverseGeocodeAsync({
                                    latitude: latitude,
                                    longitude: longitude,
                                });
                                return { ...item, address: addresses[0] };
                            })
                    );

                    setPost(itemsWithAddress);
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                console.error('There was an error!', error);
            }
        };

        fetchMyInfo();
    }, []);

    const logoutbutton = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃하시겠습니까?',
            [
                { text: '취소', onPress: () => {}, style: 'cancel' },
                {
                    text: '로그아웃',
                    onPress: () => {
                        logoutaxios();
                    },
                    style: 'destructive',
                },
            ],
            {
                cancelable: true,
                onDismiss: () => {},
            }
        );
    };

    const logoutaxios = () => {
        axios
            .post(`http://${context.ipLap}:3003/logout`)
            .then((response) => {
                if (response.data.success) {
                    console.log(response.data.message);
                    navigation.navigate('Login');
                } else {
                    console.error('로그아웃 실패: ', response.data.message);
                }
            })
            .catch((error) => {
                console.error('There was an error!', error);
            });
    };

    const PostItem = ({ item }) => {
        let accelText;
        switch (item.accel) {
            case 0:
                accelText = '급가속';
                break;
            case 1:
                accelText = '급감속';
                break;
            case 2:
                accelText = '과속';
                break;
            default:
                accelText = '알 수 없음';
        }

        return (
            <View
                style={{
                    flex: 1,
                    marginTop: '2%',
                    backgroundColor: '#E3E3E3',
                    padding: 10,
                    margin: '2%',
                    width: '95%',
                    borderRadius: 15,
                    flexDirection: 'row', // 세로방향 배치
                    justifyContent: 'space-between', // 컴포넌트들 사이의 공간 고르게 분배
                    borderWidth: 1,
                    borderColor: '#BFBFBF',
                }}
            >
                <View style={{ flexDirection: 'column' }}>
                    <Text style={{ fontSize: 19, marginBottom: 5 }}>{item.time}</Text>
                    <Text>위도 : {item.latitude}</Text>
                    <Text>경도 : {item.longitude}</Text>
                    <Text>
                        주소 : {item.address.region} {item.address.city} {item.address.street}
                    </Text>
                </View>
                <Text
                    style={{
                        color: '#b11a1a',
                        justifyContent: 'flex-start',
                        fontSize: 23,
                        fontFamily: 'Kingt',
                    }}
                ></Text>
                <Text
                    style={{
                        color: '#3b5998',
                        justifyContent: 'flex-start',
                        fontSize: 23,
                        fontFamily: 'Kingt',
                    }}
                >
                    {accelText}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.banner}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('./icons/left_button.png')} style={styles.iconbutton}></Image>
                </TouchableOpacity>
                <Text style={styles.title}>내정보</Text>
                <TouchableOpacity onPress={logoutbutton}>
                    <Image source={require('./icons/logout.png')} style={styles.iconbutton}></Image>
                </TouchableOpacity>
            </View>

            <View style={styles.viewst}>
                <TouchableOpacity style={styles.button1}>
                    <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={{ justifyContent: 'flex-start', fontSize: 22, fontFamily: 'Kingt' }}>
                            <Text style={{ color: '#3b5998', fontSize: 30 }}>'{context.numplate}'</Text>
                        </Text>
                        <Image source={require('./icons/usericon.png')} style={{ width: 50, height: 50 }}></Image>
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
                </TouchableOpacity>
            </View>
            <View style={styles.viewst}>
                <TouchableOpacity style={styles.button1}>
                    <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={styles.button2_text}>신고 횟수</Text>
                        <Text style={styles.button2_text2}>{context.reportcnt} 회</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={styles.button2_text}>신고받은 횟수</Text>
                        <Text style={styles.button2_text2}>{context.reportedcnt} 회</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={styles.button2_text}>급가속/감속 횟수</Text>
                        <Text style={styles.button2_text2}>
                            {context.upcnt} 회 / {context.downcnt} 회
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.flist}>
                <FlatList data={post} renderItem={PostItem} keyExtractor={(item) => item.id} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    banner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '3%',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 30,
        fontFamily: 'Kingt',
    },
    button1: {
        flex: 1,
        marginTop: '7%',
        backgroundColor: '#E3E3E3',
        padding: 10,
        borderColor: 'black', // 테두리 색상 설정
        margin: '2%',
        width: '95%',
        borderRadius: 15,
        flexDirection: 'column', // 세로방향 배치
        justifyContent: 'space-between', // 컴포넌트들 사이의 공간 고르게 분배
        borderWidth: 1,
        borderColor: '#BFBFBF',
    },
    topbutton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#E3E3E3',
        padding: 10,
        borderColor: 'black', // 테두리 색상 설정
        margin: '2%',
        width: '95%',
        borderRadius: 15,
        flexDirection: 'column', // 세로방향 배치
        justifyContent: 'space-between', // 컴포넌트들 사이의 공간 고르게 분배
        borderWidth: 1,
        borderColor: '#BFBFBF',
    },
    viewst: {
        margin: '2%',
        marginTop: '-2%',
        flexDirection: 'row',
        marginVertical: '-0.5%',
    },
    flist: {
        margin: '2%',
        height: '55%',
        marginTop: '1%',
        flexDirection: 'row',
        marginVertical: '-0.5%',
    },
    button2_date: {
        justifyContent: 'flex-start',
        padding: 5,
        fontSize: 20,
        fontFamily: 'Kingt',
    },
    button2_text: {
        justifyContent: 'flex-start',
        fontSize: 23,
        fontFamily: 'Kingt',
    },
    button2_text2: {
        justifyContent: 'flex-start',
        fontSize: 23,
        fontFamily: 'Kingt',
        marginRight: '3%',
    },
    iconbutton: { width: 40, height: 40, marginHorizontal: 7 },
});
