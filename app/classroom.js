import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

const Classroom = () => {
  const logoRatio = null;
  Image.getSize('../constants/images/brand/wizdriflogo_png.png', (width, height) => { logoRatio = width /width;})
  return (
    <SafeAreaView style={{
        flex:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:COLORS.dark
    }}>
        <View style={{
        alignContent:'flex-start',
        flexDirection: 'row',
        justifyContent:'flex-start',
        flex:1,
        width: '90%', height: '30%'
        }}>
          <Image
            style={{ width: 50, aspectRatio: logoRatio, alignSelf:"center"}}
            source={require('../constants/images/brand/wizdriflogo_png.png')}
          />
        </View>
        
        <ScrollView style={{
        alignContent:'space-around',
        flexDirection: 'column',
        flex:7,
        width:'100%',
        backgroundColor:COLORS.white,
        borderTopRightRadius: 70,
        }}>
        
        </ScrollView>
    </SafeAreaView>
  )
}

export default Classroom;