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
import Notebook from "./notebook";
import PostView from "./postView";
import Studyhall from "./studyhall";
import WizWar from "./wizwarMenu";
import CardView from "./cardView";
import Homework from "./homework";
import CreatePost from "./createPost";
import CreateCard from "./createCard";
import Orbs from "./orbs";
import DuelPrep from "./duelprep";
import DuelScreen from "./duelScreen";

const Stack = createStackNavigator();
const app = initializeApp(firebaseConfig);
const index = () => {
  const navigation = useRouter();
  
  return (
      <Stack.Navigator initialRouteName="start" screenOptions={{
        headerShown: false,
        gestureEnabled: false
      }}>
        <Stack.Screen name="start" component={Start} />
        <Stack.Screen name="signUp1" component={SignUp1} />
        <Stack.Screen name="signUpStudent" component={SignUpStudent} />
        <Stack.Screen name="signUpStudent2" component={SignUpStudent2} />
        <Stack.Screen name="classroom" component={Classroom} />
        <Stack.Screen name="notebook" component={Notebook} />
        <Stack.Screen name="studyhall" component={Studyhall} />
        <Stack.Screen name="wizwar" component={WizWar} />
        <Stack.Screen name="postview" component={PostView} />
        <Stack.Screen name="cardview" component={CardView} />
        <Stack.Screen name="createpost" component={CreatePost} />
        <Stack.Screen name="createcard" component={CreateCard} />
        <Stack.Screen name="homework" component={Homework} />
        <Stack.Screen name="orbs" component={Orbs} />
        <Stack.Screen name="duelprep" component={DuelPrep} />
        <Stack.Screen name="duelscreen" component={DuelScreen} />
        
      </Stack.Navigator>
  );
};

export default index;