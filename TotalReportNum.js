import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button, ImageBackground, Alert, Image, ScrollView } from 'react-native';
import axios from 'axios';

export default function TotalReportNum() {

    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get("http://${context.ipLap}:8081/Toreport")
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    });

    return (
        <View style={styles.image}>
            <View style={styles.logoview}>
                <Image source={require('./logocrop.png')} style={styles.logo}></Image>
            </View>
            <View style={styles.topview}>
                <View style={styles.kmfontview}>
                    <Text style={styles.speedfont}>총 신고 횟수: </Text>
                    <Text style={styles.speedfont2}> 회</Text>
                </View>
                <View style={styles.kmfont2view}>
                    <Text style={styles.speedfont3}>신고내역 </Text>
                </View>
                <ScrollView>
                    {data.map((item, index) => (
                        <TouchableOpacity
                        key={index} style={styles.topbutton}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 290 }}>
                        <Text style={{ justifyContent: 'flex-start', fontSize: 22 }}>
                            {item.date}{'\n'}{'\n'}{item.other_np}
                        </Text>
                            <Image source={{ uri: item.imgpath }} style={{ width: 50, height: 50 }}></Image>
                        </View>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
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
        fontSize: 30,
    },
    speedfont2: {
        fontSize: 70,
    },
    speedfont3: {
        fontSize: 15,
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
        marginTop: 60,
        marginStart: 20,
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
        margin: '10%',
        flexDirection: 'row',
     
    },
    addview: {
        margin: '2%',
        flex: 1,
        height: '100%',
    },
    kmfontview: {
        marginTop: -50,
        paddingStart: '10%',
        paddingEnd: '10%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
    },
    kmfont2view: {
        margin: '5%',
        paddingEnd: '5%',
        justifyContent: 'space-between',
        width: '80%',
    },
    shadow: {
        //그림자
        backgroundColor: '#fff',
        width: 200,
        height: 200,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {
                    width: 10,
                    height: 10,
                },
                shadowOpacity: 0.5,
                shadowRadius: 10,
            },
            android: {
                elevation: 20,
            },
        }),
    },
});