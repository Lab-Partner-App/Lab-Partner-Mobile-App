import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, PermissionsAndroid, FlatList, Button} from 'react-native';
import { TextInput } from 'react-native-paper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';




const NameSection = ({ navigation }) => {
    
    let [username,setUserName]=useState('');  

    const handleSubmit = () => {
    // Navigate to the next screen and pass the username
        navigation.navigate('ConnectDevice', { username });
    };

    return (
        <View style={styles.container}>
        <View style={styles.scroll}>
            <View>
            <TextInput
            mode='outlined'
            label={username}
            outlineColor='black'
            style={styles.tinput}
            value={username}
            onChangeText={text=>setUserName(text)}
            underlineStyle={{borderWidth:5}}
            >

            </TextInput>
            </View>
        <View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.txtstyle}>Enter Your Email</Text>
            </TouchableOpacity>
        </View>


        </View>
        </View>
    )
}

const styles = StyleSheet.create({
   button:{
        width:'100%',
        height:50,
        backgroundColor:'#F2A922',
        alignItems:'center',
        justifyContent:'center',
        marginTop:20,
        borderRadius:10

   },
   txtstyle:{
         color:'#590202',
         fontSize:20
   },
       container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor:'#8C4303'

    },
    scroll:{
        padding:20,
        width:'100%',
        height:'100%',
        display:'flex',
        justifyContent:'center',
  
        
       
    },
    tinput:{
        borderWidth:0,

    },
    scanBtn: {
        width: "90%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#F2A922',
        borderRadius: 5,
        alignSelf: "center",
        marginBottom: hp(2),
        marginTop:hp(1)
    },


})


export default NameSection;
