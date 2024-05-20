import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions, Switch } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get, remove, onChildChanged, off} from 'firebase/database';
import Relic from "./objects/relicObj";
import Loadout from "./objects/loadoutObj";
import DuelQueue from "./objects/duelqueueObj";
import DuelState from "./objects/duelState";
import Match from "./objects/matchObj";

const DuelScreen = ({route}) => {
    const { currentUser, settings} = route.params;
    const navigation = useNavigation();
    let currentXP = currentUser.getXp();
    let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
    let xpProgress = currentXP/req;
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modal2Visible, setModal2Visible] = React.useState(false);
    const [modal3Visible, setModal3Visible] = React.useState(false);
    const { width, height } = Dimensions.get('window');
    const [relicArray, setRelicArray] = React.useState([]);
    const [ranked, setRanked] = React.useState(false);
    const [hasRelics, setHasRelics] = React.useState(true);
    let d = new Date();
  
    const [playedRelics, setPlayedRelics] = React.useState([]);
    const [playSelection, setPlaySelection] = React.useState([]);
    const [selectedRelic, setSelectedRelic] = React.useState("0-0");
  
    const isHost = (currentUser.getUsername() == settings.host) ? true : false;
  
    return (
    <SafeAreaView style={{
        flex: 1,
        display: 'flex',
        backgroundColor:COLORS.dark,
        alignItems:'center'
    }}>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 2,
          marginTop: 20,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View style={{
            flex: 2,
            flexDirection:'row',
            width:'100%',
            marginBottom:10,
            justifyContent:'center',
            alignItems:'center'
          }}>
            <Image
            style={{  width: 50, height: '100%', alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
            />

            <View style={{flex: 1, justifyContent:'space-around', alignItems:'flex-end'}}>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={1} color='#FFFFFF' width={null} />
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>HP</Text>
                </View>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={1} color='#FFFFFF' width={null} />
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>MP</Text>
                </View>
            </View>

          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: "space-around", width: "95%"}}>
  {Array.from({ length: 7 }, (_, i) => (
    <View key={i} style={{
      flex:1,
      aspectRatio: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      margin:5
    }}>
      <Image
        style={{ width: "160%", height: "160%", alignSelf: "center", opacity: 0.2 }}
        source={Relic.frame((isHost ? settings.guestLoad[i] : settings.hostLoad[i]))}
      />
      <Image
        style={{ width: "500%", height: "500%", alignSelf: "center", opacity: 1, position: 'absolute' }}
        source={Relic.icon((isHost ? settings.guestLoad[i] : settings.hostLoad[i]))}
      />
    </View>
  ))}
</View>

        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 8,
          marginTop: 20,
          marginBottom: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'space-around',
          alignItems:'center'
        }]}>
        
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 3,
          marginTop: 20,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
            <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>{currentUser.getUsername()}</Text>
          <View style={{
            flex: 2,
            flexDirection:'row',
            width:'100%',
            marginBottom:10,
            justifyContent:'space-around',
            alignItems:'center'
          }}>
            <Image
            style={{  width: 50, height: '100%', alignSelf:"flex-start"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
            />

            <View style={{flex: 1, justifyContent:'space-around', alignItems:'flex-end'}}>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={1} color='#FFFFFF' width={null} />
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>HP</Text>
                </View>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={1} color='#FFFFFF' width={null} />
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>MP</Text>
                </View>
            </View>

          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: "space-around", width: "95%"}}>
  {Array.from({ length: 7 }, (_, i) => (
    <TouchableOpacity key={i} style={{
      flex:1,
      aspectRatio: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      margin:5
    }}>
      <Image
        style={{ width: "160%", height: "160%", alignSelf: "center", opacity: 0.2 }}
        source={Relic.frame((isHost ? settings.hostLoad[i] : settings.guestLoad[i]))}
      />
      <Image
        style={{ width: "500%", height: "500%", alignSelf: "center", opacity: 1, position: 'absolute' }}
        source={Relic.icon((isHost ? settings.hostLoad[i] : settings.guestLoad[i]))}
      />
    </TouchableOpacity>
  ))}
</View>

        </View>
    </SafeAreaView>
  )
}

export default DuelScreen;