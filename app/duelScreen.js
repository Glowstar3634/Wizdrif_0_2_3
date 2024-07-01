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

    const [myPlays, setMyPlays] = React.useState([]);
    const [theirPlays, setTheirPlays] = React.useState([]);
    const [playedRelics, setPlayedRelics] = React.useState(["0-0","0-0","0-0"]);
    const [playSelection, setPlaySelection] = React.useState(["0-0","0-0","0-0"]);
    const [selectedRelic, setSelectedRelic] = React.useState("0-0");
    const [theirEffects, setTheirEffects] = React.useState(["","",""]);
    const [myEffects, setMyEffects] = React.useState(["","",""]);
    const [effects, setEffects] = React.useState(["","",""]);

    const [showEffects, setShowEffects] = React.useState(false);
    const [hostActiveRelics, setHostActiveRelics] = React.useState([]);
    const [guestActiveRelics, setGuestActiveRelics] = React.useState([]);

    const [myTurn, setMyTurn] = React.useState(false);

    const [matchCreated, setMatchCreated] = React.useState(false);
    var listenTime = d.getTime();
  
    const isHost = (currentUser.getUsername() == settings.host) ? true : false;
    
    const matchRef = ref(database, "match/" + req); // Adjust 'req' as necessary

    let childChangedListener = onChildChanged(matchRef, handleMatchUpdate);
    var isListenerActive = false;

    
    const listenForOpponent = () => {
      listenTime = d.getTime();
      console.log(`${currentUser.getUsername()} is listening...`);
      
      // Ensure no duplicate listeners
      if (!isListenerActive) {
        childChangedListener = onChildChanged(ref(database, "match/" + req), handleMatchUpdate);
        isListenerActive = true;
      }
    };
    
    const stopListenForOpponent = () => {
      console.log(`${currentUser.getUsername()} stopped listening.`);
      off(ref(database, "match/" + req), 'child_changed', handleMatchUpdate);
      isListenerActive = false; // Reset listener active status
    };
    


    const handleMatchUpdate = async(data) => {
      if(!myTurn){
        const changedReq = data.val();
        console.log("Received Data! " + currentUser.getUsername())
      if (data.key > listenTime){
        if((changedReq.player == "Host") == !isHost){
          setTheirPlays(prevPlays => [...prevPlays, [changedReq.play[0], changedReq.play[1], changedReq.play[2]]])
          console.log("TheirPlays! " + currentUser.getUsername())
        }
        setPlayedRelics([changedReq.play[0],changedReq.play[1],changedReq.play[2]])

        if (!changedReq.state) {
          console.error("State is undefined or null", changedReq);
          return; // Skip processing if state is invalid
        }
    
        const requiredProps = [
          'hostHP', 'hostMP', 'hostMPR', 'hostDmg', 'hostDef',
          'guestHP', 'guestMP', 'guestMPR', 'guestDmg', 'guestDef',
          'hostTurn', 'relicSlots', 'hostActives', 'guestActives'
        ];
    
        let missingProps = requiredProps.filter(prop => changedReq.state[prop] === undefined);
        if (missingProps.length > 0) {
          console.error("Missing or undefined properties in state:", missingProps);
          return; // Skip processing if properties are missing
        }

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
          changedReq.state.relicSlots,
          changedReq.state.hostActives,
          changedReq.state.guestActives
        )
        setGameState(newState)
        console.log("Update! " + currentUser.getUsername())
        if (newState.getHostTurn() === isHost){
          setMyTurn(true);
          stopListenForOpponent();
          console.log("Stopped Listening! " + currentUser.getUsername())
        }else{
          setMyTurn(false);
          listenForOpponent();
          console.log("Started Listening! " + currentUser.getUsername())
        }
        setHostActiveRelics(Array.from(changedReq.state.hostActives))
        setGuestActiveRelics(Array.from(changedReq.state.guestActives))
        console.log("Actives! " + currentUser.getUsername())
      }
      }else{
        console.log("It's already your turn, no need to update yet, " + currentUser.getUsername() + "!")
      }
    }

    React.useEffect(() => {
  if (isHost && !matchCreated) {
    const matchRef = ref(database, "match/" + req + "/" + d.getTime() + "/state");
    const startState = new DuelState();
    set(matchRef, startState).then(() => {
      console.log("Match created, hosted by", currentUser.getUsername());
      setMyTurn(true);
      setMatchCreated(true);
      listenForOpponent();
    });
  } else if (!isHost) {
    listenForOpponent();
  }

  return () => {
    stopListenForOpponent(); 
  };
}, []);


    const retrieveEffects = (relics, mine) => {
      const newEffects = [
        Relic.effect(relics[0])[0],
        Relic.effect(relics[1])[0],
        Relic.effect(relics[2])[0]
      ];
    
      // Update the effects state
      setEffects(newEffects);
    
      // Use a callback to ensure the effects state is updated before setting showEffects to true
      setShowEffects(true);
    };

    React.useEffect(() => {
      if (showEffects) {
        const timeoutId = setTimeout(() => {
          setShowEffects(false);
        }, 6000);
        
        clearTimeout(timeoutId);
      }
      return
    }, [showEffects]);

    const selectRelic = (relic) => {
      let newSelection = [];
      setSelectedRelic(relic);

      if(playSelection.indexOf("0-0") == 0){
        newSelection.push(relic)
        newSelection.push("0-0")
        newSelection.push("0-0")
        setPlaySelection(newSelection)
      }
      else if(playSelection.indexOf("0-0") == 1){
        newSelection.push(playSelection[0])
        newSelection.push(relic)
        newSelection.push("0-0")
        setPlaySelection(newSelection)
      }
      else if(playSelection.indexOf("0-0") == 2){
        newSelection.push(playSelection[0])
        newSelection.push(playSelection[1])
        newSelection.push(relic)
        setPlaySelection(newSelection)
      }
      else if(playSelection.indexOf("0-0") == -1){
        newSelection.push(playSelection[1])
        newSelection.push(playSelection[2])
        newSelection.push(relic)
        setPlaySelection(newSelection)
      }
    }

    const playRelics = () => {
      animateRelicPlay();
      const check = checkRelics();
      console.log("Check! " + currentUser.getUsername())
      if (check == "!") {
        const time = d.getTime();
        const playerRef = ref(database, "match/" + req + "/" + time + "/player");
        const playRef = ref(database, "match/" + req + "/" + time + "/play");
        const stateRef = ref(database, "match/" + req + "/" + time + "/state");
        console.log("Refs! " + currentUser.getUsername())
        set(playerRef, isHost ? "Host" : "Guest")
          .then(() => {
            console.log("Player! " + currentUser.getUsername())
            return set(playRef, playSelection);//Playing the relics
          })
          .then(() => {
            console.log("Relics! " + currentUser.getUsername())
            setPlayedRelics(playSelection);
            console.log("Selection! " + currentUser.getUsername())
            const newState = calculateRelics(gameState, isHost); 
            console.log("Calculation! " + currentUser.getUsername())
            return set(stateRef, newState); //Updating the state
          })
          .then(() => {
            console.log("Update! " + currentUser.getUsername())
            setMyPlays((prevMyPlays) => [...prevMyPlays, playSelection]);
            console.log("MyPlays! " + currentUser.getUsername())
            setPlaySelection(["0-0", "0-0", "0-0"]);
            if (newState.getHostTurn() == isHost) {
              setMyTurn(true);
              stopListenForOpponent()
              console.log("Stopped Listening! " + currentUser.getUsername())
            } else {
              setMyTurn(false);
              listenForOpponent();
              console.log("Started Listening! " + currentUser.getUsername())
            }
          });
      } else {
        console.warn(check);
        setPlaySelection(["0-0", "0-0", "0-0"]);
      }
    };

    function hasDuplicates(array) {
      const elementCount = {};
      for (let element of array) {
          if (elementCount[element] && element != "0-0") {
              return true; // Duplicate found
          }
          elementCount[element] = 1;
      }
      return false;
    }

    const checkRelics = () => {
      //Checking total mana cost of the play
      let playMana = 0;
      let manaMulti = 1;

      for(let p = 0; p < theirPlays.length; p++){
        for(let r = 0; r < 3; r++){
          let playsAgo = 99;
          playsAgo = theirPlays.length - p - 1;
          if(theirPlays[p][r] === "5-4"){
            if(playsAgo == 0){
              manaMulti += 0.25
            }
          }
        }
      }

      for(let i = 0; i < 3; i++){
        playMana += Relic.mana(playSelection[i])*manaMulti
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

      //Checking duplicate relics
      if (hasDuplicates(playSelection)){ 
        return "You cannot play duplicate relics!"
      }

      //Checking cooldown conditions
      for(let i = 0; i < 3; i++){
        //checking single use of english relic
        if(parseInt(playSelection[i].split('-')[0]) == 3){
          for (const play of myPlays){
            for(let j = 0; j < 3; j++){
              if(play[j] == playSelection[i]){
                return "You cannot use the same English relic more than once!"
              }
            }
          }
        }

        //checking for enabled specials
        if(parseInt(playSelection[i].split('-')[0]) == 8 && myPlays.length < 5){
          return "You cannot play a Special relic until your 6th turn!"
        }

        //checking all cooldowns
        for(let p = 0; p < myPlays.length; p++){
          for(let r = 0; r < 3; r++){
            let playsAgo = 99;
            if(myPlays[p][r] == playSelection[i]){
              playsAgo = myPlays.length - p - 1;
              if(playsAgo < Relic.cool(playSelection[i])){
                return (Relic.name(playSelection[i]) + " is still on cooldown for another " + (Relic.cool(playSelection[i]) - playsAgo ) + " move(s)!")
              }else{
                console.error(Relic.name(playSelection[i]) + " was played " + (Relic.cool(playSelection[i]) - playsAgo ) + " moves ago!")
              }
            }
          }
        }
      }
      return "!"
    }

    const calculateRelics = (currentState, isHost) => {
      let skip = false;
      let totalDamage = 0;
      let totalManaChange = 0;
      let manaMulti = 1;

      console.log("PreCalc! " + currentUser.getUsername())
      //Pre-calc relic effects
      for(let p = 0; p < theirPlays.length; p++){
        for(let r = 0; r < 3; r++){
          let playsAgo = 99;
          playsAgo = theirPlays.length - p - 1;
          if(theirPlays[p][r] === "5-4"){
            if(playsAgo == 0){
              manaMulti += 0.25
              if(isHost){
                currentState.setGuestActives(currentState.guestActives.splice(currentState.guestActives.indexOf("5-4"), 1))
              }else{
                currentState.setHostActives(currentState.hostActives.splice(currentState.hostActives.indexOf("5-4"), 1))
              }
            }
          }else if(theirPlays[p][r] === "7-2"){
            if(playsAgo == 0){
              let broken = Math.floor(Math.random() * 3);
              playSelection[broken] = "0-0"
              if(isHost){
                currentState.setGuestActives(currentState.guestActives.splice(currentState.guestActives.indexOf("7-2"), 1))
              }else{
                currentState.setHostActives(currentState.hostActives.splice(currentState.hostActives.indexOf("7-2"), 1))
              }
            }
          }
        }
      }
      
      console.log("Calc! " + currentUser.getUsername())
      //Calculating relic effects
      for(let i = 0; i < currentState.relicSlots; i++){
        let selection = playSelection[i];

        if (selection === "1-1") {
          console.log("Handling 1-1");
          if(isHost){
            //Effects
            totalDamage += 12*currentState.hostDmg/currentState.guestDef;

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("1-1")*manaMulti)
          }else{
            //Effects
            totalDamage += 12*currentState.guestDmg/currentState.hostDef;

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("1-1")*manaMulti)
          }
          skip = true

        } else if (selection === "1-2") {
          console.log("Handling 1-2");
          if(isHost){
            //Effects
            currentState.setHostDmg(currentState.hostDmg + 0.3)
            let newActives = currentState.hostActives
            newActives.push("1-2")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("1-2")*manaMulti)
          }else{
            //Effects
            currentState.setGuestDmg(currentState.guestDmg + 0.3)
            let newActives = currentState.guestActives
            newActives.push("1-2")
            currentState.setGuestActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("1-2")*manaMulti)
          }

        } else if (selection === "1-3") {
          console.log("Handling 1-3");
          if(isHost){
            //Effects

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("1-3")*manaMulti)
          }else{
            //Effects

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("1-3")*manaMulti)
          }
        } else if (selection === "2-1") {
          console.log("Handling 2-1");
          if(isHost){
            //Effects
            totalDamage += 25*currentState.hostDmg/currentState.guestDef

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("2-1")*manaMulti)
          }else{
            //Effects
            totalDamage += 25*currentState.guestDmg/currentState.hostDef;

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("2-1")*manaMulti)
          }
        } else if (selection === "2-2") {
          console.log("Handling 2-2");
          if(isHost){
            //Effects
            totalDamage += 18*currentState.hostDmg/currentState.guestDef;

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("2-2")*manaMulti)
          }else{
            //Effects
            totalDamage += 18*currentState.guestDmg/currentState.hostDef;

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("2-2")*manaMulti)
          }
        } else if (selection === "2-3") {
          console.log("Handling 2-3");
          if(isHost){
            //Effects
            if(currentState.hostDef < 1){
              currentState.setHostDef(1-((1-currentState.hostDef)/2))
            }
            if(currentState.hostDmg < 1){
              currentState.setHostDmg(1-((1-currentState.hostDmg)/2))
            }

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("2-3")*manaMulti)
          }else{
            //Effects
            if(currentState.guestDef < 1){
              currentState.setGuestDef(1-((1-currentState.guestDef)/2))
            }
            if(currentState.guestDmg < 1){
              currentState.setGuestDmg(1-((1-currentState.guestDmg)/2))
            }

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("2-3")*manaMulti)
          }
        } else if (selection === "3-1") {
          console.log("Handling 3-1");
          if(isHost){
            //Effects
            

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("3-1")*manaMulti)
          }else{
            //Effects
            

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("3-1")*manaMulti)
          }
        } else if (selection === "3-2") {
          console.log("Handling 3-2");
          if(isHost){
            //Effects
            

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("3-2")*manaMulti)
          }else{
            //Effects
            

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("3-2")*manaMulti)
          }
        } else if (selection === "3-3") {
          console.log("Handling 3-3");
          if(isHost){
            //Effects
            currentState.setHostMPR(currentState.hostMPR + 8)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("3-3")*manaMulti)
          }else{
            //Effects
            currentState.setGuestMPR(currentState.hostMPR + 8)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("3-3")*manaMulti)
          }
        } else if (selection === "4-1") {
          console.log("Handling 4-1");
          if(isHost){
            //Effects
            if(currentState.hostHP > 20){
              currentState.setHostHP(currentState.hostHP - 20)
              currentState.setHostDmg(currentState.hostDmg + 0.2)
            }
            let newActives = currentState.hostActives
            newActives.push("4-1")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("4-1")*manaMulti)
          }else{
            //Effects
            if(currentState.guestHP > 20){
              currentState.setGuestHP(currentState.guestHP - 20)
              currentState.setGuestDmg(currentState.guestDmg + 0.2)
            }
            let newActives = currentState.guestActives
            newActives.push("4-1")
            currentState.setGuestActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("4-1")*manaMulti)
          }
        } else if (selection === "4-2") {
          console.log("Handling 4-2");
          if(isHost){
            //Effects
            let newActives = currentState.hostActives
            newActives.push("4-2")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("4-2")*manaMulti)
            currentState.setHostMP(currentState.hostMP*0.35)
          }else{
            //Effects
            let newActives = currentState.guestActives
            newActives.push("4-2")
            currentState.setGuestActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("4-2")*manaMulti)
            currentState.setGuestMP(currentState.guestMP*0.35)
          }
        } else if (selection === "4-3") {
          console.log("Handling 4-3");
          if(isHost){
            //Effects
            totalDamage += 15*currentState.hostDmg/currentState.guestDef;
            if(currentState.hostHP < 85){
              currentState.setHostHP(currentState.hostHP + 15)
            }else {
              currentState.setHostHP(100)
            }

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("4-3")*manaMulti)
          }else{
            //Effects
            totalDamage += 15*currentState.guestDmg/currentState.hostDef;
            if(currentState.guestHP < 85){
              currentState.setGuestHP(currentState.guestHP + 15)
            }else {
              currentState.setGuestHP(100)
            }

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("4-3")*manaMulti)
          }
        } else if (selection === "5-1") {
          console.log("Handling 5-1");
          if(isHost){
            //Effects
            if(currentState.hostHP < 85){
              currentState.setHostHP(currentState.hostHP + 15)
            } else{
              currentState.setHostHP(100)
            }

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("5-1")*manaMulti)
          }else{
            //Effects
            if(currentState.guestHP < 85){
              currentState.setGuestHP(currentState.guestHP + 15)
            } else{
              currentState.setGuestHP(100)
            }

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("5-1")*manaMulti)
          }
        } else if (selection === "5-2") {
          console.log("Handling 5-2");
          if(isHost){
            //Effects
            if(currentState.hostDef < 1.9){
              currentState.setHostDef(currentState.hostDef + 0.1)
            } else{
              currentState.setHostDef(2)
            }

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("5-2")*manaMulti)
          }else{
            //Effects
            if(currentState.guestDef < 1.9){
              currentState.setGuestDef(currentState.guestDef + 0.1)
            } else{
              currentState.setGuestDef(2)
            }

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("5-2")*manaMulti)
          }
        } else if (selection === "5-3") {
          console.log("Handling 5-3");
          if(isHost){
            //Effects
            totalDamage += 10*currentState.hostDmg/currentState.guestDef;
            let newActives = currentState.hostActives
            newActives.push("5-3")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("5-3")*manaMulti)
          }else{
            //Effects
            totalDamage += 10*currentState.guestDmg/currentState.hostDef;
            let newActives = currentState.guestActives
            newActives.push("5-3")
            currentState.setGuestActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("5-3")*manaMulti)
          }
        } else if (selection === "5-4") {
          console.log("Handling 5-4");
          if(isHost){
            //Effects
            let newActives = currentState.hostActives
            newActives.push("5-4")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("5-4")*manaMulti)
          }else{
            //Effects
            let newActives = currentState.guestActives
            newActives.push("5-4")
            currentState.setGuestActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("5-4")*manaMulti)
          }
        } else if (selection === "6-1") {
          console.log("Handling 6-1");
          if(isHost){
            //Effects
            totalDamage += 25*currentState.hostDmg/currentState.guestDef;

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("6-1")*manaMulti)
          }else{
            //Effects
            totalDamage += 25*currentState.guestDmg/currentState.hostDef;

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("6-1")*manaMulti)
          }
        } else if (selection === "6-2") {
          console.log("Handling 6-2");
          if(isHost){
            //Effects
            if(currentState.guestDef > 0.6){
              currentState.setGuestDef(currentState.guestDef - 0.1)
            } else{
              currentState.setGuestDef(0.5)
            }

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("6-2")*manaMulti)
          }else{
            //Effects
            if(currentState.hostDef > 0.6){
              currentState.setHostDef(currentState.hostDef - 0.1)
            } else{
              currentState.setHostDef(0.5)
            }

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("6-2")*manaMulti)
          }
        } else if (selection === "6-3") {
          console.log("Handling 6-3");
          if(isHost){
            //Effects
            totalDamage += 20*currentState.hostDmg/currentState.guestDef;
            currentState.setRelicSlots(2);
            let newActives = currentState.hostActives
            newActives.push("6-3")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("6-3")*manaMulti)
          }else{
            //Effects
            totalDamage += 20*currentState.guestDmg/currentState.hostDef;
            currentState.setRelicSlots(2);
            let newActives = currentState.guestActives
            newActives.push("6-3")
            currentState.setGuestActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("6-3")*manaMulti)
          }
        } else if (selection === "7-1") {
          console.log("Handling 7-1");
          if(isHost){
            //Effects
            

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("7-1")*manaMulti)
          }else{
            //Effects
            

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("7-1")*manaMulti)
          }
        } else if (selection === "7-2") {
          console.log("Handling 7-2");
          if(isHost){
            //Effects
            let newActives = currentState.hostActives
            newActives.push("7-2")
            currentState.setHostActives(newActives)
            

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("7-2")*manaMulti)
          }else{
            //Effects
            let newActives = currentState.guestActives
            newActives.push("7-2")
            currentState.setGuestActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("7-2")*manaMulti)
          }
        } else if (selection === "7-3") {
          console.log("Handling 7-3");
          if(isHost){
            //Effects
            let newActives = currentState.hostActives
            newActives.push("7-3")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("7-3")*manaMulti)
          }else{
            //Effects
            let newActives = currentState.hostActives
            newActives.push("7-3")
            currentState.setHostActives(newActives)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("7-3")*manaMulti)
          }
        } else if (selection === "7-4") {
          console.log("Handling 7-4");
          let damage = Math.floor(Math.random() * 21) + 5;
          if(isHost){
            //Effects
            totalDamage += damage*currentState.hostDmg/currentState.guestDef;

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("7-4")*manaMulti)
          }else{
            //Effects
            totalDamage += damage*currentState.guestDmg/currentState.hostDef;

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("7-4")*manaMulti)
          }
        } else if (selection === "8-1") {
          console.log("Handling 8-1");
          if(isHost){
            //Effects
            currentState.setGuestMP(currentState.guestMP*0.3)

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("8-1")*manaMulti)
          }else{
            //Effects
            currentState.setHostMP(currentState.hostMP*0.3)

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("8-1")*manaMulti)
          }
        } else if (selection === "8-2") {
          console.log("Handling 8-2");
          if(isHost){
            //Effects
            totalDamage += (80 - (currentState.guestDmg < 1 ? (1 - currentState.guestDmg)*10 : 0) - (currentState.guestDef < 1 ? (1 - currentState.guestDef)*10 : 0) - (100 - currentState.guestMP))*currentState.hostDmg/currentState.guestDef;

            //Mana Costs
            currentState.setHostMP(currentState.hostMP - Relic.mana("8-2")*manaMulti)
          }else{
            //Effects
            totalDamage += (80 - (currentState.hostDmg < 1 ? (1 - currentState.hostDmg)*10 : 0) - (currentState.hostDef < 1 ? (1 - currentState.hostDef)*10 : 0) - (100 - currentState.hostMP))*currentState.guestDmg/currentState.hostDef;

            //Mana Costs
            currentState.setGuestMP(currentState.guestMP - Relic.mana("8-2")*manaMulti)
          }
        }
      }

      console.log("PostCalc! " + currentUser.getUsername())
      //Post-calc relic effects
      for(let p = 0; p < myPlays.length; p++){
        for(let r = 0; r < 3; r++){
          let playsAgo = 99;
          playsAgo = myPlays.length - p - 1;
          if(myPlays[p][r] === "1-2"){
            if(playsAgo == 0){
              if(isHost){
                currentState.setHostDmg(currentState.hostDmg - 0.6)
              }else{
                currentState.setGuestDmg(currentState.guestDmg - 0.6)
              }
            }else if(playsAgo == 1){
              if(isHost){
                currentState.setHostDmg(currentState.hostDmg + 0.6)
              }else{
                currentState.setGuestDmg(currentState.guestDmg + 0.6)
              }
            } else if(playsAgo == 2){
              if(isHost){
                currentState.setHostDmg(currentState.hostDmg - 0.6)
              }else{
                currentState.setGuestDmg(currentState.guestDmg - 0.6)
              }
            } else if(playsAgo == 3){
              if(isHost){
                currentState.setHostDmg(currentState.hostDmg + 0.3)
                let newActives = currentState.hostActives
                newActives = newActives.splice(currentState.hostActives.indexOf("1-2"), 1)
                currentState.setHostActives(newActives)
              }else{
                currentState.setGuestDmg(currentState.guestDmg + 0.3)
                let newActives = currentState.guestActives
                newActives = newActives.splice(currentState.guestActives.indexOf("1-2"), 1)
                currentState.setGuestActives(newActives)
              }
            }else {
              console.error(myPlays[p][r] + " was played " + playsAgo + " moves ago")
            }
          }else if(theirPlays[p][r] === "7-3"){
            if(playsAgo == 0 && totalDamage > 12){
              if(isHost){
                let reflectedDamage = (totalDamage - 12)/currentState.hostDef;
                if(currentState.hostHP > reflectedDamage){
                  currentState.setHostHP(currentState.hostHP - reflectedDamage)
                }else{
                  currentState.setHostHP(0)
                }
                let newActives = currentState.hostActives
                newActives = newActives.splice(currentState.hostActives.indexOf("7-3"), 1)
                currentState.setHostActives(newActives)
              }else{
                let reflectedDamage = (totalDamage - 12)/currentState.guestDef;
                if(currentState.guestHP > reflectedDamage){
                  currentState.setGuestHP(currentState.guestHP - reflectedDamage)
                }else{
                  currentState.setGuestHP(0)
                }
                let newActives = currentState.guestActives
                newActives = newActives.splice(currentState.guestActives.indexOf("7-3"), 1)
                currentState.setGuestActives(newActives)
              }
            }
          }else if(myPlays[p][r] === "4-1"){
            if(playsAgo == 1){
              if(isHost){
                currentState.setHostDmg(currentState.hostDmg - 0.2)
                let newActives = currentState.hostActives
                newActives = newActives.splice(currentState.hostActives.indexOf("4-1"), 1)
                currentState.setHostActives(newActives)
              }else{
                currentState.setGuestDmg(currentState.guestDmg - 0.2)
                let newActives = currentState.guestActives
                newActives = newActives.splice(currentState.guestActives.indexOf("4-1"), 1)
                currentState.setGuestActives(newActives)
              }
            }
          }else if(myPlays[p][r] === "4-2"){
            if(playsAgo == 0){
              if(isHost){
                currentState.setHostDmg(currentState.hostDmg + 0.65)
              }else{
                currentState.setGuestDmg(currentState.guestDmg + 0.65)
              }
            } else if(playsAgo == 1){
              if(isHost){
                currentState.setHostDmg(currentState.hostDmg - 0.65)
                let newActives = currentState.hostActives
                newActives = newActives.splice(currentState.hostActives.indexOf("4-2"), 1)
                currentState.setHostActives(newActives)
              }else{
                currentState.setGuestDmg(currentState.guestDmg - 0.65)
                let newActives = currentState.guestActives
                newActives = newActives.splice(currentState.guestActives.indexOf("4-2"), 1)
                currentState.setGuestActives(newActives)
              }
            }
          }else if(myPlays[p][r] === "5-3"){
            if(playsAgo == 0){
              if(isHost){
                totalDamage += 10*currentState.hostDmg/currentState.guestDef;
              }else{
                totalDamage += 10*currentState.guestDmg/currentState.hostDef;
              }
            }else if(playsAgo == 1){
              if(isHost){
                totalDamage += 10*currentState.hostDmg/currentState.guestDef;
                let newActives = currentState.hostActives
                newActives = newActives.splice(currentState.hostActives.indexOf("5-3"), 1)
                currentState.setHostActives(newActives)
              }else{
                totalDamage += 10*currentState.guestDmg/currentState.hostDef;
                let newActives = currentState.guestActives
                newActives = newActives.splice(currentState.guestActives.indexOf("5-3"), 1)
                currentState.setGuestActives(newActives)
              }
            }
          }else{
            console.error(myPlays[p][r] + " - - -")
          }
        }
      }

      console.log("Dealing Damage! " + currentUser.getUsername())
      //Deal Damage
      if(isHost){
        if(currentState.guestHP > totalDamage){
          currentState.setGuestHP(currentState.guestHP - totalDamage)
        }else{
          currentState.setGuestHP(0)
        }
      }else{
        if(currentState.hostHP > totalDamage){
          currentState.setHostHP(currentState.hostHP - totalDamage)
        }else{
          currentState.setHostHP(0)
        }
      }

      console.log("Turn Switch! " + currentUser.getUsername())
      //Turn Switch
      if(!skip){
        currentState.setHostTurn(isHost ? false : true)
      }

      console.log("Mana Regen! " + currentUser.getUsername())
      //Mana Regen
      if(isHost){
        if(currentState.guestMP < 100-currentState.guestMPR){
          currentState.setGuestMP(currentState.guestMP + currentState.guestMPR)
        }else{
          currentState.setGuestMP(100)
        }
      }else{
        if(currentState.hostMP < 100-currentState.hostMPR){
          currentState.setHostMP(currentState.hostMP + currentState.hostMPR)
        }else{
          currentState.setHostMP(100)
        }
      }

      return currentState;
    }

    const animateRelicPlay = () => {

    }

    const removeActive = (relic) ={

    }
  
    return (
    <SafeAreaView style={{
        flex: 1,
        display: 'flex',
        backgroundColor:COLORS.dark,
        alignItems:'center'
    }}>
        <View style={{
          flex:3,
          marginTop:20,
          width:'95%',
          flexDirection:'row',
          alignItems:'center',
          justifyContent:'space-evenly'
        }}>
          <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 1,
          marginTop: 20,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:2,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center',
          marginRight: 10
        }]}>
          
          <View style={{
            flex: 2,
            flexDirection:'column',
            width:'90%',
            marginBottom:10,
            justifyContent:'space-evenly',
            alignItems:'center',
            paddingLeft: 10
          }}>

            <View style={{flex: 1, justifyContent:'space-around', alignItems:'flex-end', flexDirection:'row'}}>
                <View style={{width: "90%", flexDirection:'column', justifyContent:'flex-start', alignItems:'center', transform: [{ rotate: '270deg'}]}}>
                    <Progress.Bar style={{width: "120%",color:'#FFFFFF'}} progress={(isHost ? gameState.getGuestDmg()/2 : gameState.getHostDmg()/2)} color={COLORS.red} width={null} />
                </View>
                <View style={{width: "90%", flexDirection:'column', justifyContent:'flex-start', alignItems:'center', transform: [{ rotate: '270deg'}]}}>
                    <Progress.Bar style={{width: "120%",color:'#FFFFFF'}} progress={(isHost ? gameState.getGuestDef()/2 : gameState.getHostDef()/2)} color={COLORS.yellow} width={null} />
                </View>
            </View>
            <View style={{flex: 1, justifyContent:'space-around', alignItems:'flex-end', flexDirection:'row'}}>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>DMG</Text>
                </View>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>DEF</Text>
                </View>
            </View>

          </View>

        </View>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 4,
          marginTop: 20,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:2,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          
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
            <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 15, alignItems:'center'}]}>{isHost ? settings.guest : settings.host }</Text>
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
        source={Relic.frame((isHost ? settings.guestLoad[i] : settings.hostLoad[i]))}
      />
      <Image
        style={{ width: "500%", height: "500%", alignSelf: "center", opacity: 1, position: 'absolute' }}
        source={Relic.icon((isHost ? settings.guestLoad[i] : settings.hostLoad[i]))}
      />
    </TouchableOpacity>
  ))}
</View>

        </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 8,
          marginTop: 10,
          marginBottom: 10,
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
          <View style={{flexDirection:'row', height: 60}}> 
          {Array.from({ length: (isHost ? guestActiveRelics.length : hostActiveRelics.length) }, (_, i) => (
    <View key={i} style={{
      height:'100%',
      aspectRatio: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      margin:5,
      opacity: 0.5
    }}>
      <Image
        style={{ width: "160%", height: "160%", alignSelf: "center", opacity: 0.2 }}
        source={Relic.frame((isHost ? guestActiveRelics[i] : hostActiveRelics[i]))}
      />
      <Image
        style={{ width: "500%", height: "500%", alignSelf: "center", opacity: 1, position: 'absolute' }}
        source={Relic.icon((isHost ? guestActiveRelics[i] : hostActiveRelics[i]))}
      />
    </View>
  ))}
          </View>
          <View style={{flexDirection: "row", justifyContent: 'space-around', width:"100%", opacity:(showEffects ? 1: 0)}}> 
          {(theirEffects[0] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 12, alignItems:'center', textAlign:'center'}]}>{theirEffects[0]}</Text>)}
          {(theirEffects[0] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 12, alignItems:'center', textAlign:'center'}]}>{theirEffects[1]}</Text>)}
          {(theirEffects[0] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 12, alignItems:'center', textAlign:'center'}]}>{theirEffects[2]}</Text>)}
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
          <View style={{flexDirection: "row", justifyContent: 'space-around', width:"100%", opacity:(showEffects ? 1: 0)}}> 
            {(effects[0] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 15, alignItems:'center', textAlign:'center'}]}>{effects[0]}</Text>)}
            {(effects[1] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 15, alignItems:'center', textAlign:'center'}]}>{effects[1]}</Text>)}
            {(effects[2] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 15, alignItems:'center', textAlign:'center'}]}>{effects[2]}</Text>)}
          </View>
          <View style={{flexDirection:'row', height: 60}}> 
          {Array.from({ length: (isHost ? hostActiveRelics.length : guestActiveRelics.length) }, (_, i) => (
    <View key={i} style={{
      height:'100%',
      aspectRatio: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      margin:5,
      opacity: 0.5
    }}>
      <Image
        style={{ width: "160%", height: "160%", alignSelf: "center", opacity: 0.2 }}
        source={Relic.frame((isHost ? hostActiveRelics[i] : guestActiveRelics[i]))}
      />
      <Image
        style={{ width: "500%", height: "500%", alignSelf: "center", opacity: 1, position: 'absolute' }}
        source={Relic.icon((isHost ? hostActiveRelics[i] : guestActiveRelics[i]))}
      />
    </View>
  ))}
          </View>
          <View style={{flexDirection: "row", justifyContent: 'space-around', width:"100%", opacity:(showEffects ? 1: 0)}}> 
          {(myEffects[0] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 12, alignItems:'center', textAlign:'center'}]}>{myEffects[0]}</Text>)}
          {(myEffects[1] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 12, alignItems:'center', textAlign:'center'}]}>{myEffects[1]}</Text>)}
          {(myEffects[2] != "") && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 12, alignItems:'center', textAlign:'center'}]}>{myEffects[2]}</Text>)}
          </View>
          
        </View>

        <View style={{flex:1, flexDirection: "row", justifyContent: 'space-evenly', alignItems: 'center', width: "100%"}}>
        <TouchableOpacity style={{height:'100%', alignItems:'center', justifyContent:'center'}} onPress={() => {}}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'80%',
                width:50,
                padding:5,
                opacity: (myTurn ? 1 : 0.5),
                alignSelf: 'center',
                backgroundColor: COLORS.dark1,
                borderWidth:2,
                borderColor:COLORS.gray2,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Image
            style={{  width: "100%", height: '100%', alignSelf:"flex-start"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-flag-96.png')}
            />

              </View>
           </TouchableOpacity>
           <TouchableOpacity style={{height:'100%', alignItems:'center', justifyContent:'center'}} onPress={() => {}}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'80%',
                width:50,
                padding:5,
                opacity: (myTurn ? 1 : 0.5),
                alignSelf: 'center',
                backgroundColor: COLORS.dark1,
                borderWidth:2,
                borderColor:COLORS.gray2,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Image
            style={{  width: "100%", height: '100%', alignSelf:"flex-start"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-handshake-90.png')}
            />

              </View>
           </TouchableOpacity>
        <View style={{flexDirection:'row', width: '40%'}}> 
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
        <TouchableOpacity style={{height:'100%', alignItems:'center', justifyContent:'center'}} onPress={() => {
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
                  fontSize: 15,
                  width:'auto',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center',
                  paddingLeft: 15,
                  paddingRight: 15
                }}>CONFIRM</Text>

              </View>
           </TouchableOpacity>
        </View>
        

        <View style={{
          flex:3,
          width:'95%',
          flexDirection:'row',
          alignItems:'center',
          justifyContent:'space-evenly'
        }}>
          <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 1,
          marginTop: 20,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:2,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center',
          marginRight: 10
        }]}>
          
          <View style={{
            flex: 2,
            flexDirection:'column',
            width:'90%',
            marginBottom:10,
            justifyContent:'space-evenly',
            alignItems:'center',
            paddingLeft: 10
          }}>

            <View style={{flex: 1, justifyContent:'space-around', alignItems:'flex-end', flexDirection:'row'}}>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center', transform: [{ rotate: '270deg'}]}}>
                    <Progress.Bar style={{width: "120%",color:'#FFFFFF'}} progress={(isHost ? gameState.getHostDmg()/2 : gameState.getGuestDmg()/2)} color={COLORS.red} width={null} />
                </View>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'flex-start', alignItems:'center', transform: [{ rotate: '270deg'}]}}>
                    <Progress.Bar style={{width: "120%",color:'#FFFFFF'}} progress={(isHost ? gameState.getHostDef()/2 : gameState.getGuestDef()/2)} color={COLORS.yellow} width={null} />
                </View>
            </View>
            <View style={{flex: 1, justifyContent:'space-around', alignItems:'flex-end', flexDirection:'row'}}>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>DMG</Text>
                </View>
                <View style={{width: "90%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                    <Text style={[styles.startInputHint, {color:COLORS.white, fontSize: 12}]}>DEF</Text>
                </View>
            </View>

          </View>

        </View>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 4,
          marginTop: 20,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:2,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
            
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
            <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 15, alignItems:'center'}]}>{currentUser.getUsername()}</Text>
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
        </View>
        
    </SafeAreaView>
  )
}

export default DuelScreen;