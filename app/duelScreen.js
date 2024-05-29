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
import {ref, set, get, remove, onChildChanged, onChildAdded, off} from 'firebase/database';
import Relic from "./objects/relicObj";
import Loadout from "./objects/loadoutObj";
import DuelQueue from "./objects/duelqueueObj";
import DuelState from "./objects/duelState";
import Match from "./objects/matchObj";

const DuelScreen = ({route}) => {
    const { currentUser, settings, req} = route.params;
    const navigation = useNavigation();
    let currentXP = currentUser.getXp();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modal2Visible, setModal2Visible] = React.useState(false);
    const [modal3Visible, setModal3Visible] = React.useState(false);
    const { width, height } = Dimensions.get('window');
    const [relicArray, setRelicArray] = React.useState([]);
    const [ranked, setRanked] = React.useState(false);
    const [hasRelics, setHasRelics] = React.useState(true);
    let d = new Date();

    const [gameState, setGameState] = React.useState(new DuelState());

    var myPlays = [];
    const [playedRelics, setPlayedRelics] = React.useState(["0-0","0-0","0-0"]);
    const [playSelection, setPlaySelection] = React.useState(["0-0","0-0","0-0"]);
    const [selectedRelic, setSelectedRelic] = React.useState("0-0");

    const [myTurn, setMyTurn] = React.useState(false);

    const [matchCreated, setMatchCreated] = React.useState(false);
    var listenTime = d.getTime();
  
    const isHost = (currentUser.getUsername() == settings.host) ? true : false;
    
    

    const listenForOpponent = () => {
      listenTime = d.getTime();
      onChildChanged(ref(database, ("match/" + req)), handleMatchUpdate)
      console.log(currentUser.getUsername() + " is listening...")
    }

    const stopListenForOpponent = () => {
      off(ref(database, ("match/" + req)), handleMatchUpdate)
      console.log(currentUser.getUsername() + " stopped listening.")
    }

    const handleMatchUpdate = async(data) => {
      if(!myTurn){
        const changedReq = data.val();
      if (data.key > listenTime){
        console.log("new data: " + changedReq.play + ": " + currentUser.getUsername())
        setPlayedRelics([changedReq.play[0],changedReq.play[1],changedReq.play[2]])
        console.log("The state: " + changedReq.state)
        const newState = new DuelState(
          changedReq.state.hostHP,
          changedReq.state.hostMP,
          changedReq.state.hostMPR,
          changedReq.state.hostDmg,
          changedReq.state.hostDef,
          changedReq.state.guestHP,
          changedReq.state.guestMP,
          changedReq.state.guestMPR,
          changedReq.state.guestDmg,
          changedReq.state.guestDef,
          changedReq.state.hostTurn,
          changedReq.state.relicSlots
        )
        setGameState(newState)
        if (newState.getHostTurn() === isHost){
          setMyTurn(true);
          console.log("It's your turn, " + currentUser.getUsername() + "!")
          stopListenForOpponent();
        }else{
          setMyTurn(false);
          console.log("It's no longer your turn, " + currentUser.getUsername() + ".")
          listenForOpponent();
        }
      }
      }else{
        console.log("It's already your turn, no need to update yet, " + currentUser.getUsername() + "!")
      }
    }

    React.useEffect(() => {
      if (isHost && !matchCreated) {
        const matchRef = ref(database, "match/" + req + "/" + d.getTime() + "/state");
        const startState = new DuelState();
        set(matchRef, startState)
          .then(() => {
            console.log("Match created, hosted by " + currentUser.getUsername());
            setMyTurn(true);
            setMatchCreated(true);
            listenForOpponent();
          });
      } else if (!isHost) {
        listenForOpponent();
      }
    
      return () => {
        stopListenForOpponent(); // Clean up the listener on unmount
      };
    }, []);

    

    const selectRelic = (relic) => {
      let newSelection = [];
      setSelectedRelic(relic);

      if(playSelection.indexOf("0-0") == 0){
        newSelection.push(relic)
        newSelection.push("0-0")
        newSelection.push("0-0")
        console.log("relic added to first slot")
        setPlaySelection(newSelection)
      }
      else if(playSelection.indexOf("0-0") == 1){
        newSelection.push(playSelection[0])
        newSelection.push(relic)
        newSelection.push("0-0")
        console.log("relic added to second slot")
        setPlaySelection(newSelection)
      }
      else if(playSelection.indexOf("0-0") == 2){
        newSelection.push(playSelection[0])
        newSelection.push(playSelection[1])
        newSelection.push(relic)
        console.log("relic added to third slot")
        setPlaySelection(newSelection)
      }
      else if(playSelection.indexOf("0-0") == -1){
        newSelection.push(playSelection[1])
        newSelection.push(playSelection[2])
        newSelection.push(relic)
        console.log("relic pushed to last slot")
        setPlaySelection(newSelection)
      }
    }

    const playRelics = () => {
      console.log("Playing relics...");
      animateRelicPlay();
      const check = checkRelics();
      if (check === "!") {
        const time = d.getTime();
        const playerRef = ref(database, "match/" + req + "/" + time + "/player");
        const playRef = ref(database, "match/" + req + "/" + time + "/play");
        const stateRef = ref(database, "match/" + req + "/" + time + "/state");
        set(playerRef, isHost ? "Host" : "Guest")
          .then(() => {
            return set(playRef, playSelection);
          })
          .then(() => {
            setPlayedRelics(playSelection);
            const newState = calculateRelics(gameState, isHost);
            return set(stateRef, newState);
          })
          .then(() => {
            console.log("All relics played");
            myPlays.push(playSelection);
            setPlaySelection(["0-0", "0-0", "0-0"]);
            if (newState.getHostTurn() == isHost) {
              setMyTurn(true);
              console.log("It's your turn, " + currentUser.getUsername() + "!");
              stopListenForOpponent();
            } else {
              setMyTurn(false);
              console.log("It's no longer your turn, " + currentUser.getUsername() + ".");
              listenForOpponent();
            }
          });
      } else {
        console.warn(check);
        setPlaySelection(["0-0", "0-0", "0-0"]);
      }
    };

    const checkRelics = () => {
      //Checking total mana cost of the play
      let playMana = 0;
      for(let i = 0; i < 3; i++){
        playMana += Relic.mana(playSelection[i])
      }
      if(isHost){
        if(playMana > gameState.getHostMP()){
          return "You don't have enough mana for this play!"
        }
      }else {
        if(playMana > gameState.getGuestMP()){
          return "You don't have enough mana for this play!"
        }
      }

      //Checking cooldown conditions
      for(let i = 0; i < 3; i++){
        //checking single use of english relic
        if(parseInt(playSelection[i].split('-')[0]) - 1 == 3){
          for (const play of myPlays){
            for(let j = 0; j < 3; j++){
              if(play[j] === playSelection[i]){
                return "You cannot use the same English relic more than once!"
              }
            }
          }
        }

        //checking for enabled specials
        if(parseInt(playSelection[i].split('-')[0]) - 1 == 8){
          if(myPlays.length < 5) {
            return "You cannot play a Special relic until your 6th turn!"
          }
        }

        //checking all cooldowns
        for(let p = 0; p < myPlays.length; p++){
          for(let r = 0; r < 3; r++){
            let playsAgo = 99;
            if(myPlays[p][r] == playSelection[i]){
              playsAgo = myPlays.length - p - 1;
              if(playsAgo < Relic.cool(playSelection[i])){
                return (Relic.name(playSelection[i]) + " is still on cooldown for another " + (Relic.cool(playSelection[i]) - playsAgo ) + " move(s)!")
              }
            }
          }
        }

        return "!"
      }
    }

    const calculateRelics = (currentState, isHost) => {
      const skip = false;

      for(let i = 0; i < currentState.relicSlots; i++){
        let selection = playSelection[i];

        if (selection === "1-1") {
          console.log("Handling 1-1");
        } else if (selection === "1-2") {
          console.log("Handling 1-2");
        } else if (selection === "1-3") {
          console.log("Handling 1-3");
        } else if (selection === "2-1") {
          console.log("Handling 2-1");
          if(isHost){
            //Effects
            if(currentState.guestHP > 25){
              currentState.setGuestHP(currentState.guestHP - 25)
            } else{
              currentState.setGuestHP(0)
            }

            //Mana Costs
            if(currentState.hostMP > 30){
              currentState.setHostMP(currentState.hostMP - 30)
            } else{
              currentState.setHostMP(0)
            }
          }else{
            //Effects
            if(currentState.hostHP > 25){
              currentState.setHostHP(currentState.hostHP - 25)
            } else{
              currentState.setHostHP(0)
            }

            //Mana Costs
            if(currentState.guestMP > 30){
              currentState.setGuestMP(currentState.guestMP - 30)
            } else{
              currentState.setGuestMP(0)
            }
          }
        } else if (selection === "2-2") {
          console.log("Handling 2-2");
          if(isHost){
            //Effects
            if(currentState.guestHP > 18){
              currentState.setGuestHP(currentState.guestHP - 18)
            } else{
              currentState.setGuestHP(0)
            }

            //Mana Costs
            if(currentState.hostMP > 20){
              currentState.setHostMP(currentState.hostMP - 20)
            } else{
              currentState.setHostMP(0)
            }
          }else{
            //Effects
            if(currentState.hostHP > 18){
              currentState.setHostHP(currentState.hostHP - 18)
            } else{
              currentState.setHostHP(0)
            }

            //Mana Costs
            if(currentState.guestMP > 20){
              currentState.setGuestMP(currentState.guestMP - 20)
            } else{
              currentState.setGuestMP(0)
            }
          }
        } else if (selection === "2-3") {
          console.log("Handling 2-3");
          if(isHost){
            //Effects
            if(currentState.hostDef < 0){
              currentState.setHostDef(currentState.hostDef/2)
            }
            if(currentState.hostDmg < 0){
              currentState.setHostDmg(currentState.hostDmg/2)
            }

            //Mana Costs
            if(currentState.hostMP > 15){
              currentState.setHostMP(currentState.hostMP - 15)
            } else{
              currentState.setHostMP(0)
            }
          }else{
            //Effects
            if(currentState.guestDef < 0){
              currentState.setGuestDef(currentState.guestDef/2)
            }
            if(currentState.guestDmg < 0){
              currentState.setGuestDmg(currentState.guestDmg/2)
            }

            //Mana Costs
            if(currentState.guestMP > 15){
              currentState.setGuestMP(currentState.guestMP - 15)
            } else{
              currentState.setGuestMP(0)
            }
          }
        } else if (selection === "3-1") {
          console.log("Handling 3-1");
        } else if (selection === "3-2") {
          console.log("Handling 3-2");
        } else if (selection === "3-3") {
          console.log("Handling 3-3");
          if(isHost){
            //Effects
            currentState.setHostMPR(currentState.hostMPR + 8)

            //Mana Costs
            if(currentState.hostMP > 20){
              currentState.setHostMP(currentState.hostMP - 20)
            } else{
              currentState.setHostMP(0)
            }
          }else{
            //Effects
            currentState.setGuestMPR(currentState.hostMPR + 8)

            //Mana Costs
            if(currentState.guestMP > 20){
              currentState.setGuestMP(currentState.guestMP - 20)
            } else{
              currentState.setGuestMP(0)
            }
          }
        } else if (selection === "4-1") {
          console.log("Handling 4-1");
        } else if (selection === "4-2") {
          console.log("Handling 4-2");
        } else if (selection === "4-3") {
          console.log("Handling 4-3");
        } else if (selection === "5-1") {
          console.log("Handling 5-1");
        } else if (selection === "5-2") {
          console.log("Handling 5-2");
        } else if (selection === "5-3") {
          console.log("Handling 5-3");
        } else if (selection === "5-4") {
          console.log("Handling 5-4");
        } else if (selection === "6-1") {
          console.log("Handling 6-1");
        } else if (selection === "6-2") {
          console.log("Handling 6-2");
        } else if (selection === "6-3") {
          console.log("Handling 6-3");
        } else if (selection === "7-1") {
          console.log("Handling 7-1");
        } else if (selection === "7-2") {
          console.log("Handling 7-2");
        } else if (selection === "7-3") {
          console.log("Handling 7-3");
        } else if (selection === "7-4") {
          console.log("Handling 7-4");
        } else if (selection === "8-1") {
          console.log("Handling 8-1");
        } else if (selection === "8-2") {
          console.log("Handling 8-2");
        }
      }

      if(!skip){
        currentState.setHostTurn(isHost ? false : true)
      }
      return currentState;
    }

    const animateRelicPlay = () => {

    }
  
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
            width:'90%',
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
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={(isHost ? gameState.getGuestHP()/100 : gameState.getHostHP()/100)} color={COLORS.green} width={null} />
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>HP</Text>
                </View>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={(isHost ? gameState.getGuestMP()/100 : gameState.getHostMP()/100)} color={COLORS.wizBlueLight} width={null} />
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
          justifyContent:'space-evenly',
          alignItems:'center'
        }]}>
          <View style={{}}> 
            <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 25, alignItems:'center'}]}>{myTurn ? "Your Turn!" : "Opponent's Turn..."}</Text>
            <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>Timer</Text>
          </View>
          <View style={{flexDirection:'row'}}> 
          {Array.from({ length: 3 }, (_, i) => (
    <View key={i} style={{
      flex:1,
      aspectRatio: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      margin:5
    }}>
      <Image
        style={{ width: "160%", height: "160%", alignSelf: "center", opacity: 0.2 }}
        source={Relic.frame(playedRelics[i])}
      />
      <Image
        style={{ width: "500%", height: "500%", alignSelf: "center", opacity: 1, position: 'absolute' }}
        source={Relic.icon(playedRelics[i])}
      />
    </View> 
  ))}
          </View>
          <View style={{flexDirection:'row', width: '50%'}}> 
          {Array.from({ length: 3 }, (_, i) => (
    <TouchableOpacity key={i} style={{
      flex:1,
      aspectRatio: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      margin:5,
      opacity: (myTurn ? 1 : 0.5)
    }} activeOpacity={myTurn ? 0.2 : 0.5}>
      <Image
        style={{ width: "160%", height: "160%", alignSelf: "center", opacity: 0.2 }}
        source={Relic.frame(playSelection[i])}
      />
      <Image
        style={{ width: "500%", height: "500%", alignSelf: "center", opacity: 1, position: 'absolute' }}
        source={Relic.icon(playSelection[i])}
      />
    </TouchableOpacity>
  ))}
          </View>
        </View>

        <TouchableOpacity style={{height:50, alignItems:'center', justifyContent:'center'}} onPress={() => {
          if(myTurn){
            playRelics()
          }
        }}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'80%',
                width:'auto',
                opacity: (myTurn ? 1 : 0.5),
                alignSelf: 'center',
                backgroundColor: COLORS.wizBlue,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'auto',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center',
                  paddingLeft: 25,
                  paddingRight: 25
                }}>CONFIRM</Text>

              </View>
           </TouchableOpacity>

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
            width:'90%',
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
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={(isHost ? gameState.getHostHP()/100 : gameState.getGuestHP()/100)} color={COLORS.green} width={null} />
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>HP</Text>
                </View>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                    <Progress.Bar style={{width: "80%",color:'#FFFFFF'}} progress={(isHost ? gameState.getHostMP()/100 : gameState.getGuestMP()/100)} color={COLORS.wizBlueLight} width={null} />
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
    }} onPress={() => {
      let r = isHost ? settings.hostLoad[i] : settings.guestLoad[i];
      selectRelic(r);
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