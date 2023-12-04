import React, { useEffect, useState, useContext } from 'react';
import { FlatList, View, Text, Image, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import IpContext from './IpContext';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function Sanctions() {
    const [posts, setPosts] = useState([]);
    const context = useContext(IpContext);
    const navigation = useNavigation();

    useEffect(() => {
        axios
            .post(`http://${context.ipLap}:3003/getSanctions`, {
                userName: context.numplate,
            })
            .then((response) => setPosts([response.data.results][0]))
            .catch((error) => console.error(error));
    }, []);

    const PostItem = ({ item }) => {
        console.log('***');
        console.log(item);
        console.log('***');
        const filename = item.img_path.split('\\').pop();
        return (
            <View style={styles.post}>
                <Text style={styles.date}>{item.date}</Text>
                <Image
                    style={styles.image}
                    source={{ uri: `http://${context.ipLap}:3003/images/${filename}` }}
                    onError={(error) => console.log(error.nativeEvent.error)}
                />

                <Text style={styles.content}>번호판 : {item.other_np}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.banner}>
                <TouchableOpacity onPress={() => navigation.goBack()} onp>
                    <Image source={require('./icons/left_button.png')} style={styles.iconbutton}></Image>
                </TouchableOpacity>
                <Text style={styles.title}>신고당한 내역</Text>
                <View style={{ width: 50 }} />
            </View>
            <View style={styles.viewst}>
                <FlatList data={posts} renderItem={PostItem} keyExtractor={(item) => item.id} />
            </View>
        </SafeAreaView>
    );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    post: {
        marginBottom: windowHeight * 0.02,
        padding: windowWidth * 0.05,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#BFBFBF',
        borderRadius: 10,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
        fontFamily: 'Kingt',
    },
    image: {
        width: '100%',
        height: windowHeight * 0.2,
    },
    content: {
        marginTop: windowHeight * 0.01,
        fontSize: 16,
        fontFamily: 'Kingt',
    },
    viewst: {
        margin: '2%',
        marginTop: '2%',
        flexDirection: 'row',
        marginVertical: '-0.5%',
        height: windowHeight * 0.82,
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
    iconbutton: { width: 40, height: 40, marginHorizontal: 7 },
});
