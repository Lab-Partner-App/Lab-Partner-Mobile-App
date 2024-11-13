
// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { colors } from '../screens/utils/colors';
import { fonts, fontSize } from '../screens/utils/fonts';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  PermissionsAndroid,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {LineChart} from 'react-native-charts-wrapper';

// Type definitions
interface BleManagerType {
  start: (options: { showAlert: boolean }) => Promise<void>;
  scan: (serviceUUIDs: string[], seconds: number, allowDuplicates: boolean) => Promise<void>;
  getDiscoveredPeripherals: () => Promise<Peripheral[]>;
  connect: (peripheralId: string) => Promise<void>;
  startNotification: (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => Promise<void>;
  disconnect: (peripheralId: string) => Promise<void>;
}

interface BLECharacteristicData {
  value: number[];
  peripheral: string;
  characteristic: string;
  service: string;
}
interface VoltageDataPoint {
  x: number;
  y: number;
}


// Constants
const SERVICE_UUID = '0000FFE0-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB';
const DEVICE_NAME = 'BT05';

const ConnectDevice: React.FC = ({route}) => {
  // const [receivedValue, setReceivedValue] = useState<string>('Waiting for data...');

  const { username }=route.params;

  const [receivedValue, setReceivedValue] = useState<number>(0.0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedPeripheralId, setConnectedPeripheralId] = useState<string | null>(null);

  // const [voltageData, setVoltageData] = useState([]);
  const [voltageData, setVoltageData] = useState<VoltageDataPoint[]>([]);

  const addDataPoint = () => {
    setVoltageData([...voltageData, { x: voltageData.length, y: receivedValue }]);

    // setCurrentVoltage(currentVoltage);
    // setReceivedValue(parseFloat(Math.random().toFixed(4)));
    // setReceivedValue(parseFloat((0.3 + Math.random() * 0.1).toFixed(4)));
  };

  // const xData = voltageData.map(d => d.x);
  // const yData = voltageData.map(d => d.y);


  //transforming data to react native chart format


  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Bluetooth Permission',
            message: 'App needs bluetooth permission',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  const connectToDevice = useCallback(async (peripheralId: string) => {
    try {
      await BleManager.connect(peripheralId);
      setIsConnected(true);
      setConnectedPeripheralId(peripheralId);
      console.log('Connected to device:', peripheralId);

      await BleManager.startNotification(
        peripheralId,
        SERVICE_UUID,
        CHARACTERISTIC_UUID
      );

      console.log('Started notification');
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection failed', 'Could not connect to the device');
    }
  }, []);

  const handleUpdateValue = useCallback((data: BLECharacteristicData) => {
    
    const value = String.fromCharCode.apply(null, data.value);
    const floatValue = parseFloat(value);
    setReceivedValue(floatValue);
    console.log('Received value:', value);
    
  }, []);

  const scanAndConnect = useCallback(async () => {
    try {
      await BleManager.scan([SERVICE_UUID], 5, true);
      console.log('Scanning...');

      setTimeout(async () => {
        const peripherals = await BleManager.getDiscoveredPeripherals();
        console.log('Discovered peripherals:', peripherals);

        const targetDevice = peripherals.find(
          peripheral => peripheral.name === DEVICE_NAME
        );

        if (targetDevice) {
          await connectToDevice(targetDevice.id);
        } else {
          console.log('Device not found');
          Alert.alert('Error', 'Device not found');
        }
      }, 5000);
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan failed', 'Could not scan for devices');
    }
  }, [connectToDevice]);

  useEffect(() => {
    const initializeBLE = async () => {
      try {
        await BleManager.start({ showAlert: false });
        const hasPermission = await requestPermissions();
        if (hasPermission) {
          await scanAndConnect();
        } else {
          Alert.alert('Permission denied');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize Bluetooth');
      }
    };

    initializeBLE();

    // Add event listener for incoming data
    const listener = BleManager.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdateValue
    );

    return () => {
      listener.remove();
      if (connectedPeripheralId) {
        BleManager.disconnect(connectedPeripheralId);
      }
    };
  }, [scanAndConnect, handleUpdateValue, connectedPeripheralId]);

  const resetChart = () => {
    setVoltageData([]);
    setReceivedValue(0);
  };

  const chartData = {
    dataSets: [{
      values: voltageData.map(point => ({
        x: point.x,
        y: point.y,
      })),
      label: 'Voltage vs Volume',
      config: {
        color: 'rgb(45, 125, 246)',
        drawCircles: true,
        circleColor: 'rgb(45, 125, 246)',
        lineWidth: 2,
        drawValues: true,
        valueTextSize: 10,
        drawCircleHole: false,
        circleRadius: 4,
        valueFormatter: '###.0000V',
      }
    }],
  };

  return (
 
    <View style={{ flex: 1,backgroundColor:'#8C4303' }}>

            <View style={styles.navbar}>
                <Text style={styles.navtxt}>Welcome, {username} !</Text>
            </View>

            <View style={styles.fullRow}>
                <View style={styles.tempCard}>
                  
                    <Text style={styles.label}>Voltage</Text>
                    <Image style={styles.icon} source={require('../assets/images/digital.png')} />
                    <Text style={styles.recievedlabel}>{receivedValue ? receivedValue : 'N/A'} V</Text>
                  
                </View>
                <View style={styles.tempCard}>
                  
                  <Text style={[styles.label, isConnected ? styles.connected : styles.disconnected]}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                  
                  <Text style={styles.label}> {DEVICE_NAME}</Text>
                
              </View>
            </View>


        <View style={styles.container}>
              <LineChart
                style={styles.chart}
                data={chartData}
                xAxis={{
                  enabled: true,
                  granularity: 1,
                  drawGridLines: true,
                  position: 'BOTTOM',
                  labelCount: voltageData.length,
                  valueFormatter: '###ml',
                }}
                yAxis={{
                  left: {
                    enabled: true,
                    axisMinimum: 0.24,
                    axisMaximum: 0.45,
                    granularity: 0.025,
                    drawGridLines: true,
                    valueFormatter: '',
                  },
                  right: {
                    enabled: false,
                  },
                }}
                legend={{
                  enabled: true,
                  textSize: 12,
                  form: 'CIRCLE',
                  formSize: 14,
                  xEntrySpace: 10,
                  yEntrySpace: 10,
                  wordWrapEnabled: true,
                }}
                chartDescription={{
                  text: '',
                }}
                animation={{
                  durationX: 1500,
                  durationY: 1500,
                  easingX: 'EaseInOutQuart',
                  easingY: 'EaseInOutQuart',
                }}
                drawGridBackground={false}
                drawBorders={false}
                touchEnabled={true}
                dragEnabled={true}
                scaleEnabled={true}
                scaleXEnabled={true}
                scaleYEnabled={true}
                pinchZoom={true}
                doubleTapToZoomEnabled={true}
              />
            </View>

          {/* voltage chart section */}

         
          <View style={styles.chartTitleSec}>
            <Text style={styles.title}>Voltage Line Chart</Text>
            <TouchableOpacity onPress={resetChart} style={styles.chartTitleBtnSec}>
                <Text style={styles.chartTitleBtnSecText}>Reset Chart</Text>
            </TouchableOpacity>
            </View>

    <ScrollView style={{height:50}}>
      
      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>X (ml)</Text>
          <Text style={styles.tableHeader}>Y (Voltage)</Text>
        </View>
        {voltageData.map((point, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{point.x}</Text>
            <Text style={styles.tableCell}>{point.y.toFixed(4)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>


    <TouchableOpacity onPress={addDataPoint} style={styles.scanBtn}>
                <Text style={styles.btnTxt}>Add 1 ml</Text>
         </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2A922',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
//new added css
navbar:{
  width:'100%',
  height:50,
  backgroundColor:'#F2A922',
  display:'flex',
  alignItems:'flex-end',
  justifyContent:'center'

},
navtxt:{
  color:'#590202',
  fontSize:20,
  
  marginRight:20
},
bleCard: {
  width: "90%",
  padding: 10,
  alignSelf: "center",
  marginVertical: 10,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.secondary,
  elevation: 5,
  borderRadius: 5
},
nameTxt: {
  fontFamily: fonts.bold,
  fontSize: fontSize.font18,
  color: colors.text
},
button: {
  width: 100,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.primary,
  borderRadius: 5
},
btnTxt: {
  fontFamily: fonts.bold,
  fontSize: fontSize.font18,
  color: '#590202'
},
label: {
  fontSize: 20,
  textAlign: 'center',
  color: '#590202',
  fontFamily: fonts.bold,
},
recievedlabel: {
  fontSize: 25,
  textAlign: 'center',
  color: 'white',
  fontFamily: fonts.bold,
  backgroundColor:'green',
  padding:5,
  borderRadius:5,
},
icon: {
  width: 60,
  height: 60,
  resizeMode: "contain",
  marginVertical: hp(2)
},
tempCard: {
  width: wp(45),
  backgroundColor: '#F2A922',
  elevation: 2,
  paddingVertical: hp(1.5),
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center"
},
fullRow: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: hp(2),
  alignSelf: "center",
  marginBottom:15
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
chart:{
  width:'100%',
  height:200,
  alignSelf:'center',
  backgroundColor:'#F2A922',
  borderRadius:10,
  marginTop:10
},
// contentContainer: {
// flex: 1,
// justifyContent: 'center',
// alignItems: 'center',
// padding: 10,
// },
// statusText: {
// fontSize: 20,
// marginBottom: 10,
// color: '#F2A922',
// },
// container: {
//   flex:0.5,
//   padding: 8,
// },
title: {
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
  marginVertical: 10,
  marginTop:hp(2),
  color:'#F2A922'

},
chartContainer: {
  height: 200,
  width:'95%',
  alignSelf:'center',
  borderRadius:10,
  backgroundColor:'#F2A922',
  flexDirection: 'row',
  marginVertical: 8,
  padding: 10,
},
tableContainer: {
  
  backgroundColor:'#F2A922',
  borderWidth: 1,
  borderColor: '#590202',
  borderRadius:10,
},
tableRow: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderColor: '#590202',
  
},
tableHeader: {
  flex: 1,
  padding: 10,
  fontWeight: 'bold',
  backgroundColor: '#F2A922',
  textAlign: 'center',
},
tableCell: {
  flex: 1,
  padding: 10,
  textAlign:'center'
 
},
chartTitleSec:{
  display:'flex',
  flexDirection:'row',
  justifyContent:'space-between',

  marginHorizontal:20,
  marginBottom:hp(2)
  
},
chartTitleBtnSecText:{
  fontSize: 15,
  fontWeight: 'bold',
  textAlign: 'center',
  color:'white',
  
},
chartTitleBtnSec:{
  backgroundColor:'red',
  borderRadius:10,
  padding:8,
  marginTop:hp(2),
  width:100,
},

connected: {
  color: 'white',
  backgroundColor:'green',
  padding:5,
  borderRadius:5,

},
disconnected: {
  color: 'white',
  backgroundColor:'red',
  padding:5,
  borderRadius:5,

},

});

export default ConnectDevice;