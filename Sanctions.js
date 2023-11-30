import React, { useEffect, useState, useContext } from 'react';
import { FlatList, View, Text, Image, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import axios from 'axios';
import IpContext from './IpContext';

export default function Sanctions() {
    const [posts, setPosts] = useState([]);
    const context = useContext(IpContext);

    useEffect(() => {
        axios.post(`https://${context.ipLap}/getSanctions`, {
                userName: '22나2222',
            })
            .then((response) => setPosts(response.data.results))
            .catch((error) => console.error(error));
    }, []);

    const PostItem = ({ item }) => {
        const filename = item.img_path.split('\\').pop();
        return (
            <View style={styles.post}>
                <Text style={styles.date}>{item.date}</Text>
                <Image
                    style={styles.image}
                    source={{ uri: `https://${context.ipLap}/images/${filename}` }} 
                    onError={(error) => console.log(error.nativeEvent.error)}
                />
                <Text>{item.img_path}</Text>
                <Text style={styles.content}>{item.other_np}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList data={posts} renderItem={PostItem} keyExtractor={(item) => item.id} />
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
        marginBottom: windowHeight * 0.05,
        padding: windowWidth * 0.05,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 10,
    },
    date: {
        fontSize: 14,
        color: '#888',
    },
    image: {
        width: '100%',
        height: windowHeight * 0.2,
    },
    content: {
        marginTop: windowHeight * 0.02,
        fontSize: 16,
    },
});
