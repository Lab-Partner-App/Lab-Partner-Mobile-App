import {View, Text, StyleSheet, Button,Image, TouchableOpacity} from 'react-native';

const StartScreen = ({navigation}) => {
    return (
        <View style={styles.container}>

            <View style={styles.container}>
                <Image
                    source={require('../assets/images/ruhuna_uni_logo.png')}
                    style={styles.image}
                />
                <TouchableOpacity style={styles.button} onPress={()=>{
                    navigation.navigate('NameSection');
                }}>
                    <Text style={styles.buttonText}>Press Here To Start</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8C4303',
    },
    button: {
        backgroundColor: '#F2A922',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#590202',
        fontSize: 18,
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'contain', // or 'cover' depending on your needs
    },
})
export default StartScreen;
