import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const BOX_WIDTH = 50;
const JUMP_HEIGHT = WINDOW_HEIGHT / 3;

export default function DinoGame() {
    const position = useSharedValue(WINDOW_HEIGHT - BOX_WIDTH);
    const [isJumping, setIsJumping] = useState(false);

    const jump = () => {
        if (!isJumping) {
            setIsJumping(true);
            position.value = withTiming(WINDOW_HEIGHT - JUMP_HEIGHT - BOX_WIDTH, { duration: 500 }, () => {
                position.value = withTiming(WINDOW_HEIGHT - BOX_WIDTH, { duration: 500 }, () => {
                    setIsJumping(false);
                });
            });
        }
    };

    const style = useAnimatedStyle(() => {
        return { bottom: position.value };
    });

    useEffect(() => {
        const timer = setInterval(() => {
            // 여기에 장애물을 생성하고 움직이게 하는 코드를 추가할 수 있습니다.
        }, 500);

        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.box, style]} />
            <TouchableOpacity style={styles.button} onPress={jump}>
                <Text style={styles.buttonText}>Jump!</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    box: {
        position: 'absolute',
        bottom: 0,
        width: BOX_WIDTH,
        height: BOX_WIDTH,
        backgroundColor: 'tomato',
    },
    button: {
        position: 'absolute',
        bottom: 30,
        width: 100,
        height: 50,
        backgroundColor: 'dodgerblue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
    },
});
