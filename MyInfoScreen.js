import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button, ImageBackground, Alert, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import IpContext from './IpContext';
import * as Location from 'expo-location';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import Swiper from 'react-native-swiper';

export default function MyInfo() {
    const context = useContext(IpContext);

    return (
        <View style={styles.titleview}>
            <Text style={{fontSize: 30}}>내정보</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    titleview: {
        flex: 0.2,
        marginTop: 60,
        marginStart: 20,
        alignItems: 'center',
    },
});
