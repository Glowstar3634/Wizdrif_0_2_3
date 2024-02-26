import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput} from 'react-native'
import React from 'react'
import styles from '../styles/search';
import { COLORS } from '../constants';
import auth from '../firebase';
import {signOut, onAuthStateChanged, signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword} from '@firebase/auth'

const Start = () => {
  const navigation = useNavigation();

  const [usernameInput, onUsernameUpdate] = React.useState('');
  const [passwordInput, onPasswordUpdate] = React.useState('');

  const login = async() => {
    await signInWithEmailAndPassword(getAuth(), usernameInput, passwordInput);
    console.log('User signed in successfully!');
    
  }
  
  return (
    <SafeAreaView style={{
        flex:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:COLORS.dark
    }}>
        <View style={{
        alignContent:'center',
        flexDirection: 'column',
        justifyContent:'center',
        flex:2,
        width: '90%', height: '100%'
        }}>
          <Image
            style={{ width: '100%', height: '50%'}}
            source={require('../constants/images/brand/wizdriflogo_png.png')}
          />
        </View>
        
        <View style={{
        alignContent:'space-around',
        flexDirection: 'column',
        justifyContent:'flex-start',
        flex:4,
        width:'100%',
        backgroundColor:COLORS.white,
        
        borderTopRightRadius: 70,
        }}>
        <View style={{flex:3}}>
        <Text style={styles.startHeaders}>Login</Text>

        <Text style={styles.startDescs}>Sign in to continue, or {"\n"}create a new account</Text>
        </View>

        <View style={{flex:3}}>
        <Text style={styles.startInputHint}>Username</Text>

        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={usernameInput => onUsernameUpdate(usernameInput)}
            defaultValue= {usernameInput}
          />
        </View>

        <Text style={styles.startInputHint}>Password</Text>

        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={passwordInput => onPasswordUpdate(passwordInput)}
            secureTextEntry={true}
            defaultValue= {passwordInput}
          />
        </View>
        </View>

        <View style={{flex:3}}>
        <TouchableOpacity
          style={[styles.buttonStart, styles.loginButton]}
          onPress={login}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonStart, styles.signUpButton]}
          onPress={() => navigation.navigate("signUp1")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        </View>
          </View>
    </SafeAreaView>
  );
};

export default Start;