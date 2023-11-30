import React, { useState, useEffect, useContext } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import axios from 'axios';
import * as Progress from 'react-native-progress';

export default function MyInfo() {
    const context = useContext(IpContext);
    const [post, setPost] = useState([]);

    useEffect(() => {
        axios
            .post(`https://${context.ipLap}/myInfo`, { numplate: context.numplate })
            .then((response) => {
                if (response.data.success) {
                    console.log('item: ', response.data.item);
                    setPost(response.data.item); // 서버로부터 받아온 데이터를 상태 변수에 저장
                } else {
                    alert(response.data.message); // 실패 메시지 표시
                }
            })
            .catch((error) => {
                console.error('There was an error!', error);
            });
    }, []);

    const PostItem = ({ item }) => {
        return (
            <View
                style={{
                    flex: 1,
                    marginTop: '7%',
                    backgroundColor: '#E3E3E3',
                    padding: 10,
                    borderColor: 'black', // 테두리 색상 설정
                    margin: '2%',
                    width: '95%',
                    borderRadius: 15,
                    flexDirection: 'row', // 세로방향 배치
                    justifyContent: 'space-between', // 컴포넌트들 사이의 공간 고르게 분배
                    borderWidth: 1,
                    borderColor: '#BFBFBF',
                }}
            >
                <Text>{item.time}</Text>
                <Text
                    style={{
                        color: '#b11a1a',
                        justifyContent: 'flex-start',
                        fontSize: 23,
                        fontFamily: 'Kingt',
                    }}
                >
                    {' '}
                    -3{' '}
                </Text>
                <Text
                    style={{
                        color: '#3b5998',
                        justifyContent: 'flex-start',
                        fontSize: 23,
                        fontFamily: 'Kingt',
                    }}
                >
                    {item.accel === 0 ? '급가속' : '급감속'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>내정보</Text>

            <View style={styles.viewst}>
                <TouchableOpacity style={styles.button1}>
                    <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={{ justifyContent: 'flex-start', fontSize: 22, fontFamily: 'Kingt' }}>
                            <Text style={{ color: '#3b5998', fontSize: 30 }}>{context.numplate}</Text>
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

            <View style={styles.viewst}>
                <FlatList data={post} renderItem={PostItem} keyExtractor={(item) => item.id} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        marginTop: '15%',
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
});
