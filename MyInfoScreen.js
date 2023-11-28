import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import axios from 'axios';
import * as Progress from 'react-native-progress';

export default function MyInfo() {
    const context = useContext(IpContext);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>내정보</Text>
            
            <View style={styles.viewst}>
                <TouchableOpacity
                    style={styles.button1}
                >
                    <View style={{ flexDirection: 'row', flex: 0, justifyContent: 'space-between', width: '100%' }}>
                        <Text style={{ justifyContent: 'flex-start', fontSize: 22, fontFamily: 'Kingt' }}>
                            <Text style={{ color: '#3b5998', fontSize: 30}}>{context.numplate}</Text>
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
                        Lv.1
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
                            <Progress.Bar progress={0.2} width={250} height={15} color={'#3b5998'} />
                        </View>
                        <Text style={{ fontFamily: 'Kingt' }}>100/100</Text>
                        {/* 경험치에 따라 레벨도 같이 증가 */}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center"
    },
    title: {
        marginTop: '15%',
        fontSize: 30,
        fontFamily: 'Kingt',
    },
    button1: {
        flex: 1,
        marginTop: '10%',
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
});
