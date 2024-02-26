import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput} from 'react-native'
import React from 'react'
import styles from '../styles/search';
import { COLORS } from '../constants';
import firebaseConfig from "../FirebaseConfig";
import { initializeApp } from "@firebase/app";


import SignUp1 from "./signUp1";
import SignUpStudent from './signUpStudent';
import SignUpStudent2 from './signUpStudent2';
import Start from "./start";
import Classroom from "./classroom";

const Stack = createStackNavigator();
const app = initializeApp(firebaseConfig);
const index = () => {
  const navigation = useRouter();
  
  return (
      <Stack.Navigator initialRouteName="start" screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="start" component={Start} />
        <Stack.Screen name="signUp1" component={SignUp1} />
        <Stack.Screen name="signUpStudent" component={SignUpStudent} />
        <Stack.Screen name="signUpStudent2" component={SignUpStudent2} />
        <Stack.Screen name="classroom" component={Classroom} />
      </Stack.Navigator>
  );
};

export default index;