import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import StartScreen from "./screens/StartScreen.tsx";
import NameSection from "./screens/NameSection.tsx";
import ConnectDevice from "./screens/ConnectDevice.tsx";

const Stack=createNativeStackNavigator();

function App(): React.JSX.Element {
   
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="StartScreen"
                    component={StartScreen}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="NameSection"
                    component={NameSection}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="ConnectDevice"
                    component={ConnectDevice}
                    options={{headerShown: false}}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
