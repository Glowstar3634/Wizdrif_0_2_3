import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput} from 'react-native'
import React from 'react'
import styles from '../styles/search';
import Profile from "./objects/profileObj";
import { COLORS } from '../constants';

const SignUp1 = () => {
  const navigation = useNavigation();
  const newAccount = new Profile();

  const student = () => {
    newAccount.setAccount(1);
    navigation.navigate("signUpStudent", {newAccount: newAccount});
  }

  const personal = () => {
    
  }

  const educator = () => {
    
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
        justifyContent:'flex-start',
        flex:1,
        width: '90%', height: '30%'
        }}>
          <Image
            style={{ width: '50%', height: '50%', alignSelf:"center"}}
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
        <View style={{flex:1}}>
        <TouchableOpacity
          style={{}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 55, height: 55}}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        
        </View>
        <View style={{flex:4}}>
        <Text style={styles.startHeaders}>Which fits you?</Text>

        <Text style={styles.startDescs}>Choose an account type that represents {"\n"}what you are using this account for.</Text>
        </View>

        <View style={{flex:4, flexDirection:"row", alignContent:'space-around', justifyContent: "space-around"}}>
        <TouchableOpacity
          style={[styles.squareButton, {backgroundColor:COLORS.wizLBlueLight}]}
          onPress={student}
        >
            <Image
            style={{ width: '90%', height: '75%'}}
            source={require('../constants/images/Icons/Student-Button.png')}/>
            <Text style={styles.buttonText}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.squareButton, {backgroundColor:COLORS.wizBlueLight}]}
          onPress={personal}
        >
            <Image
            style={{ width: '90%', height: '75%'}}
            source={require('../constants/images/Icons/Personal-Button.png')}/>
            <Text style={styles.buttonText}>Personal</Text>
        </TouchableOpacity>
        </View>
        <View style={{flex:4, flexDirection:"row", alignContent:'space-around', justifyContent: "space-around"}}>
        <TouchableOpacity
          style={[styles.squareButton, {backgroundColor:COLORS.wizPurpLight}]}
          onPress={educator}
        >
            <Image
            style={{ width: '90%', height: '75%'}}
            source={require('../constants/images/Icons/Educator-Button.png')}/>
            <Text style={styles.buttonText}>Educator</Text>
        </TouchableOpacity>
        </View>

          </View>
    </SafeAreaView>
  );
}

export default SignUp1;