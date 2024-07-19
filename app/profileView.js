import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal, Switch} from 'react-native';
import { SelectList, MultipleSelectList  } from 'react-native-dropdown-select-list';
import * as ImagePicker from 'expo-image-picker';
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';
import {Profile} from './objects/profileObj';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get, push, child} from 'firebase/database';

const ProfileScreen = ({route}) => {
    const { currentUser, userView } = route.params;
    const navigation = useNavigation();
    const { width, height } = Dimensions.get('window');

    let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark,
      alignItems: 'center'
    }}>
      <TouchableOpacity
          style={{alignSelf:'flex-start'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
      <ScrollView style={{
        width: "100%"
      }} contentContainerStyle={{
        alignItems:'center'
      }}>
      <View style={{
        width: '100%',
        alignItems: 'center'
      }}>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center'
          }}>
          <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
          <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', borderRadius: (width), borderWidth: 2, borderColor: COLORS.white, padding: 3}}>
          <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (width)}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
            resizeMode="contain"
        />
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 24, color: COLORS.white, fontWeight: 700}]}>{currentUser.getUsername()}</Text>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {currentUser.getLevel()}</Text>
            <Progress.Bar style={{color:'#FFFFFF', marginTop: 10}} progress={xpProgress} color='#FFFFFF' width={200} />
          </View>
          </View>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen