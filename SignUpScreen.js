import React, { useContext, useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IpContext from './IpContext';

import axios from 'axios';

export default function SignUpScreen() {

    const context = useContext(IpContext);

    <View style={styles.container}>
        <Text style={styles.text}>회원가입 페이지</Text>
    </View>
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [numplate, setNumplate] = useState('');

    const navigation = useNavigation();

    // TextInput에 ref 설정
    const IdInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const numplateInputRef = useRef(null);

    const handleSignUp = () => {
        // 간단한 유효성 검사 수행
        if (!id || !password || !numplate) {
            Alert.alert('모든 필드를 채워주세요', '모든 필드를 입력해야 합니다.'); // "제목", "소제목"
            return;
        }

        // 회원가입 로직 처리
        console.log('ID:', id);
        console.log('Password:', password);
        console.log('Numplate: ', numplate);

        const data={
            "id": id,
            "password": password,
            "numplate": numplate,
        }

        axios.post(`http://${context.ipLap}:3003/signUp`, data)
        .then(response => {
            // 서버 응답 처리

            if (response.data.success) {
                console.log(response.data);
                // 회원가입 성공하면 알림창 뜨면서 로그인 페이지로 이동
                Alert.alert("회원가입 성공!", "환영합니다");
                navigation.navigate('Login');

            }
            else {
                Alert.alert("회원가입 실패", response.data.message);
            }
        })
        .catch(error => {
            console.error(error);
            return;
        });

    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <Image
                source={require('./b1.jpg')}
                style={styles.logo}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>SUNMOONCHUL</Text>
            </View>

            <Text style={{ fontSize: 12, marginBottom: 10 }}>ID</Text>
            <TextInput
                ref={IdInputRef} // ref 설정
                placeholder="ID"
                value={id}
                onChangeText={setId}
                style={styles.input}
            />
            <Text style={{ fontSize: 12, marginBottom: 10 }}>PASSWORD</Text>
            <TextInput
                ref={passwordInputRef} // ref 설정
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Text style={{ fontSize: 12, marginBottom: 10 }}>NUM PLATE</Text>
            <TextInput
                ref={numplateInputRef} // ref 설정
                placeholder="Numplate"
                value={numplate}
                onChangeText={setNumplate}
                style={styles.input}
            />
            <TouchableOpacity onPress={handleSignUp} style={[styles.buttonContainer]}>
                <Text style={[styles.buttonText]}>Sign Up</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    buttonContainer: {
        width: '100%',
        height: 'auto',
        backgroundColor: '#628F5D',
        paddingVertical: 10,
        borderRadius: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    logo: {
        width: '35%',
        height: 'auto',
        aspectRatio: 1,
        marginBottom: 24,
    },
});
