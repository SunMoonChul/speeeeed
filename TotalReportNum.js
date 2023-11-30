import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, Image, Dimensions, SafeAreaView } from 'react-native';
import axios from 'axios';
import IpContext from './IpContext';

export default function TotalReportNum() {

    const context = useContext(IpContext);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.post(`http://${context.ipLap}:3003/toreport`, {
            userName: '11오1111'
          })
            .then(response => setPosts(response.data.results))
            .catch(error => console.error(error));
    }, []);

    const PostItem = ({ item }) => {
        const filename = item.img_path.split('\\').pop();
    
        return (
          <View style={styles.post}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.imageContainer}>
                <Image
                    style={styles.image}
                    source={{ uri: `http://${context.ipLap}:3003/images/${filename}` }}
                    onError={(error) => console.log(error.nativeEvent.error)}/>
            </View>
            <Text style={styles.content}>{item.other_np}</Text>
          </View>
        );
      };
    
      return (
        <SafeAreaView style={styles.container}>
            <View style={styles.kmfontview}>
                <Text style={styles.speedfont3}>신고내역 </Text>
          <FlatList
            data={posts}
            renderItem={PostItem}
            keyExtractor={item => item.img_path}
          />
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
    imageContainer: {
        alignItems: 'flex-end',
      },
      image: {
        width: windowWidth * 0.5, // adjust the width as needed
        height: windowHeight * 0.2,
      },
    content: {
      marginTop: windowHeight * 0.02,
      fontSize: 16,
    },
    kmfontview: {
        padding: '5%',
        justifyContent: 'space-between',
        width: '100%',
    },
    speedfont3: {
        fontSize: 40,
    },
  });