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
import {ref, set, get, remove, onChildChanged, off, child} from 'firebase/database';
import Relic from "./objects/relicObj";
import Loadout from "./objects/loadoutObj";
import DuelQueue from "./objects/duelqueueObj";

const DuelPrep = ({route}) => {
  const { currentUser, opponent, rankLock} = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modal2Visible, setModal2Visible] = React.useState(false);
  const [modal3Visible, setModal3Visible] = React.useState(false);
  const [modal4Visible, setModal4Visible] = React.useState(false);
  const { width, height } = Dimensions.get('window');
  const [relicArray, setRelicArray] = React.useState([]);
  const [ranked, setRanked] = React.useState(false);
  const [hasRelics, setHasRelics] = React.useState(true);
  const [wager, setWager] = React.useState(0);
  const [loadout, setLoadout] = React.useState(["0-0","0-0","0-0","0-0","0-0","0-0","0-0"]);
  const [loadTitle, setLoadTitle] = React.useState("Empty Loadout");
  let d = new Date();
  
  const [newLoadTitle, setNewLoadTitle] = React.useState("");

  const [relicSelection, setRelicSelection] = React.useState([]);
  const [loadoutSelection, setLoadoutSelection] = React.useState([]);
  const [newLoadout, setNewLoadout] = React.useState([]);
  const [selectedRelic, setSelectedRelic] = React.useState("0-0");
  const [swapType, setSwapType] = React.useState("Add");

  const [myQR, setMyQR] = React.useState(null);
  const [myQRkey, setMyQRkey] = React.useState(null);
  const [matchedQR, setMatchedQR] = React.useState(null);
  const [matchedQRkey, setMatchedQRkey] = React.useState(null);
  const [matchObj, setMatchObj] = React.useState(null);
  const [matched, setMatched] = React.useState(false);

  const QR2obj = async (qr) => {
    try {
        const snapshot = await get(qr);
        if (snapshot.exists()) {
            const queueData = snapshot.val();
            const queueObj = new DuelQueue(
                queueData.host,
                queueData.guest,
                queueData.ranked,
                queueData.wager,
                queueData.matched,
                queueData.hostLoad,
                queueData.guestLoad,
                queueData.ready
            );
            return queueObj;
        }
        return null;
    } catch (error) {
        console.error("Error converting queue reference to object:", error);
        return null;
    }
  };

  const finishLoadout = async () => {
    const uniqueLoadout = new Set(newLoadout);
  if (uniqueLoadout.size !== newLoadout.length) {
    console.log("The loadout contains duplicates.");
    console.error("There was an error creating the loadout. Try again later.");
  } else {
    const userLoadRef = ref(database, 'users/' +currentUser.getUsername()+ "/loadouts/" + newLoadTitle);
    const snapshot = await get(userLoadRef);
    if (!snapshot.exists()){
      const loadObj = new Loadout(newLoadTitle, newLoadout);
      set(userLoadRef, loadObj)
      .then(() => {
        setModalVisible(false);
        loadLoadouts();
      })
    }
  }
  }

  var oppText = null;

  const select = (relic) => {
    setSelectedRelic(relic);
    if (relicSelection.includes(relic)){
      setSwapType("Add");
    } else{
      setSwapType("Remove");
    }
  }

  const swap = (relic) => {
    if (swapType == "Add") {
      if(newLoadout.length == 7){
        console.log("You can only have up to 7 relics in a loadout!")
      } else {
        // Remove relic from relicSelection
        const updatedRelicSelection = relicSelection.filter(item => item !== relic);
        setRelicSelection(updatedRelicSelection);
        
        // Add relic to newLoadout
        const updatedNewLoadout = [...newLoadout, relic];
        setNewLoadout(updatedNewLoadout);

        setSwapType("Remove");
      }
    } else{
      // Remove relic from relicSelection
      const updatedLoadout = newLoadout.filter(item => item !== relic);
      setNewLoadout(updatedLoadout);
      
      // Add relic to newLoadout
      const updatedRelicSelection = [...relicSelection, relic];
      setRelicSelection(updatedRelicSelection);

      setSwapType("Add");
    }
  }

  const createLoadout = () => {
    console.log("you have " + relicSelection.length )
    setModal2Visible(false);
    setModalVisible(true);
  }
   
  if (opponent != null){
    
  }
  else{
    oppText = "Random\nOpponent";
  }
  
  if (rankLock == true){
    setRanked(true);
    setWager(1);
  }

  React.useEffect(() => {
    loadRelics();
    loadLoadouts();
  }, []);

  React.useEffect(() => {
    const fetchMatchObj = async () => {
        if (matchedQR) {
            const obj = await QR2obj(matchedQR);
            setMatchObj(obj);
        }
    };
    
    fetchMatchObj();
  }, [matchedQR]);
  
  let tempreq = null;
  React.useEffect(() => {
    if (myQR) {
        setMyQRkey(tempreq);
        findADuel();
    }
}, [myQR]);

  const loadRelics = async () => {
    try {
        console.log("Initializing Relics...");
        const relicRef = ref(database, ('users/' + currentUser.getUsername() + '/relics'));
        const snapshot = await get(relicRef);
        if (snapshot.exists()) {
            console.log("Loading...");
            const relicsData = snapshot.val();
            const relicKeys = Object.keys(relicsData);
            setRelicArray(relicKeys);
            setRelicSelection([]);

            await Promise.all(relicKeys.map(async relic => {
                const oriRelic = ref(database, ('relics/' + relic));
                const snapshot = await get(oriRelic);
                const thisRelicRef = ref(database, ('users/' + currentUser.getUsername() + '/relics/' + relic));
                if (snapshot.exists()) {
                    console.log("Setting relic...");
                    await set(thisRelicRef, snapshot.val());
                    console.log("You have the Relic:" + relic);
                    var relSelNew = relicSelection;
                    relSelNew.push(relic);
                    setRelicSelection(relSelNew);
                } else {
                    console.log("The Relic " + relic + " does not exist. Removing from your possession...");
                    await remove(thisRelicRef);
                }
            }));
        } else {
            setHasRelics(false);
            console.log('You dont have any relics');
        }
    } catch (error) {
        console.log('Error loading relics:', error);
    }
  }

  const loadLoadouts = async () => {
    try {
        console.log("Initializing Loadouts...");
        const loadRef = ref(database, ('users/' + currentUser.getUsername() + '/loadouts'));
        const snapshot = await get(loadRef);
        if (snapshot.exists()) {
            console.log("Loading...");
            const loadoutsData = snapshot.val();
            const loadoutKeys = Object.keys(loadoutsData);
            const loadedLoadouts = [];

            await Promise.all(loadoutKeys.map(async key => {
                const loadoutData = loadoutsData[key];
                const { name, relics } = loadoutData;
                const loadout = new Loadout(name, relics);
                loadedLoadouts.push(loadout);
            }));

            setLoadoutSelection(loadedLoadouts);
        } else {
            setHasRelics(false);
            console.log('You dont have any loadouts');
        }
    } catch (error) {
        console.log('Error loading loadouts:', error);
    }
  };

  const queueUp = () => {
    if (!loadout.every(item => item === "0-0")){
      if (loadout.indexOf("0-0") !== -1) {
        // Are you sure? (You don't have a full loadout)
        console.warn("Incomplete loadout");
      } else {
        const d2 = new Date();
        const matchReq = "req" + d2.getTime() + "=" + currentUser.getUsername();
        const queueReference = ref(database, "queue/" + matchReq);
        const duelqueueObj = new DuelQueue(currentUser.getUsername(), "", ranked, wager, false, loadout, []);
        set(queueReference, duelqueueObj)
          .then(() => {
            setModal3Visible(true);
            tempreq = matchReq;
            setMyQRkey(matchReq)
            setMyQR(queueReference);
          })
          .catch(error => {
            console.error("Error setting queue reference:", error);
          });
      }
    }
  }

  const cancelQueue = async () => {
    if (!matched) {
      stopListeningForChildChanges();
      await remove(myQR);
      setMyQR(null);
      setMyQRkey(null);
      setModal3Visible(false);
    }else{
      stopListeningForChildChanges();
      await remove(matchedQR);
      setMyQR(null);
      setMyQRkey(null);
      setMatchedQR(null);
      setMatchedQRkey(null);
      setMatchObj(null);
      setMatched(false);
      setModal3Visible(false);
    }
  }

  const findADuel = async () => {
    const queueReference = ref(database, "queue");
    
    try {
      const snapshot = await get(queueReference);
      if (snapshot.exists()) {
        const existingReqs = Object.keys(snapshot.val());
  
        if (myQR) {
          const myQueueSnapshot = await get(myQR);
          if (myQueueSnapshot.exists()) {
            const myQueueReq = myQueueSnapshot.val();
  
            for (const queueReqKey of existingReqs) {
              const queueReq = snapshot.val()[queueReqKey];
              if (matchmade(queueReq, myQueueReq)) {
                const matchedLock = ref(database, "queue/" + queueReqKey + "/matched");
                const matchedGuest = ref(database, "queue/" + queueReqKey + "/guest");
                const matchedLoad = ref(database, "queue/" + queueReqKey + "/guestLoad");
                await set(matchedLock, true);
                await set(matchedGuest, currentUser.getUsername());
                await set(matchedLoad, myQueueReq.hostLoad); 
                await remove(myQR);
                setMyQR(null);
                setMyQRkey(null);
                setMatched(true);
                setMatchedQRkey(queueReqKey);
                setMatchedQR(ref(database, "queue/" + queueReqKey));
                getReady();
                break;
              }
            }
          } else {
            console.error("My queue request does not exist.");
          }
        } else {
          console.error("myQR is null or undefined.");
        }
        startListeningForChildChanges();
      } else {
        console.log("No queue requests found.");
      }
    } catch (error) {
      console.error("Error finding a duel:", error);
    }
  }

  const matchmade = (queueReq, myQueueReq) => {
    if (Math.abs(queueReq.wager - myQueueReq.wager) > 2) {
      return false;
    }
    if (queueReq.ranked !== myQueueReq.ranked) {
      return false;
    }
    if (queueReq.host === myQueueReq.host) {
      return false;
    }
    if (queueReq.matched === true) {
      return false;
    }
    return true;
  }

  const getReady = () => {
    stopListeningForChildChanges();
  }

  const readyUp = async () => {
    const snapshot = await get(matchedQR);
    if (snapshot.exists){
      const matchData = snapshot.val();
      setModal3Visible(false);
      if (matchData.ready === 0 || matchData.ready == undefined){
        set(child(matchedQR, "ready"), 1)
        .then(() =>{
          startWaitForOpp();
          setModal4Visible(true);
        })
      } else if (matchData.ready === 1) {
        set(child(matchedQR, "ready"), 2)
        .then(async () => {
        const finalQR = await QR2obj(matchedQR);
        stopWaitForOpp();
        setModal4Visible(false);
        navigation.navigate("duelscreen", {currentUser: currentUser, settings: finalQR, req: matchedQRkey});
        
        })
      } else if (matchData.ready === 2) {
        const finalQR = await QR2obj(matchedQR);
        stopWaitForOpp();
        setModal4Visible(false);
        navigation.navigate("duelscreen", {currentUser: currentUser, settings: finalQR, req: matchedQRkey});
        
        
      } else{
        set(child(matchedQR, "ready"), 1)
        .then(() =>{
          startWaitForOpp();
        })
      }

    } else{
      console.log("Opponent has left the match.");
      setModal3Visible(false);
    }
  }

  const startListeningForChildChanges = () => {
  if (myQR) {
    onChildChanged(myQR, handleChildChange);
  }
  };

  const stopListeningForChildChanges = () => {
  if (myQR) {
    off(myQR, handleChildChange);
  }
  };

  const startWaitForOpp = () => {
    if (matchedQR) {
      onChildChanged(matchedQR, handleReadyChange);
    }
  };
  
  const stopWaitForOpp = () => {
    if (matchedQR) {
      off(matchedQR, handleReadyChange);
    }
  };

  const handleReadyChange = async(data) => {
      const changedReq = data.val();
      if (changedReq === 2) {
        const finalQR = await QR2obj(matchedQR);
        stopWaitForOpp();
        setModal4Visible(false);
        navigation.navigate("duelscreen", {currentUser: currentUser, settings: finalQR, req: matchedQRkey});
      }
  };

  const handleChildChange = async(data) => {
    const changedReq = data.val();
    if (changedReq !== "") {
      setMatched(true);
      setMatchedQR(myQR);
      setMatchedQRkey(myQRkey);
      const obj = await QR2obj(myQR);
      setMatchObj(obj);
      getReady();
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
    <Modal
        animationType="none"
        transparent={true}
        visible={modal4Visible}
        onRequestClose={() => {
          Alert.alert('You have already pressed Go, waiting on opponent...');
        }}>
      <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent:'center', alignItems:'center'}]}>
      <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>Waiting for opponent to press GO...</Text>
      <Image
            style={{ height:100, aspectRatio: 1, alignSelf:"center", opacity:1, margin: 10}}
            source={require('../constants/images/UIcons/gradient-5812.gif')}
        />
      </View>

    </Modal>
    <Modal
        animationType="fade"
        transparent={true}
        visible={modal3Visible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modal3Visible);
        }}>
      <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.90), height: (height*0.6), justifyContent:"space-around", padding:0}]}>
          <View style={{width:"100%", flex:1 , alignItems:'center', justifyContent:'space-around'}}>
          
          <View style={{flex:1, justifyContent:'center'}}>
          {(!matched) && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>{currentUser.getUsername()}</Text>)}
          {(matched) && (matchObj != null) && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>{matchObj.getHost()}</Text>)}
          </View>

          <TouchableOpacity style={{
            width: '100%',
            flex:4 ,
            overflow:'hidden',
            justifyContent:'space-around'
          }} onPress={() => readyUp()}>
                {(!matched) &&(<Image
            style={{  height: "200%", aspectRatio: 1, alignSelf:"center"}}
            source={require('../constants/images/Icons/Quick-Duels-Searching.png')}
        />)}

{(matched) &&(<Image
            style={{  height: "200%", aspectRatio: 1, alignSelf:"center"}}
            source={require('../constants/images/Icons/Quick-Duels-Ready.png')}
        />)}
          </TouchableOpacity>

          <View style={{flex:1, width:'100%'}}>
          {(!matched) && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>Finding an Opponent...</Text>)}
          {(matched) && (matchObj) && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>{matchObj.guest}</Text>)}
          </View>
          </View>

          <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height:170,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center',
          marginTop: 20,
          marginBottom: 20,
        }]}>
          <View style={{flex:1, alignItems:'center', width:'100%', justifyContent:'space-between'}}>
          <View style={{flex:1}}>
            
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>Match</Text>
          {(!matched) &&(<Image
            style={{ flex:1 , aspectRatio: 1, alignSelf:"center", opacity:1, margin: 10}}
            source={require('../constants/images/UIcons/gradient-5812.gif')}
        />)}
          {(matched) && (matchObj) && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 18, alignItems:'center'}]}>Wager: {matchObj.wager}</Text>)}
          {(matched) && (matchObj) && (<Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 18, alignItems:'center'}]}>{(matchObj.ranked ? "Ranked" : "Casual")}</Text>)}
          
          </View>
        
          
          </View>
        </View>

          <TouchableOpacity style={{height:50, alignItems:'center', justifyContent:'center'}} onPress={() => cancelQueue()}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'80%',
                width:"80%",
                opacity: 0.8,
                alignSelf: 'center',
                backgroundColor: COLORS.gray,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Cancel</Text>

              </View>
           </TouchableOpacity>

        </View>
      </View>

    </Modal>
    
    <Modal
        animationType="fade"
        transparent={true}
        visible={modal2Visible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modal2Visible);
        }}>
      <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.90), height: (height*0.6), justifyContent:"space-around", padding:0}]}>
          <View style={{width:"100%", height:'90%'}}>
          <ScrollView> 
          <View style={{alignItems: 'center', width: "100%"}}>
          {loadoutSelection.map((loadout, index) => ((
            <TouchableOpacity style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]} key={index} onPress={()=>{
          setLoadout(loadout.relics);
          setLoadTitle(loadout.name);
          setModal2Visible(false);
        }}>
          <View style={{alignItems:'center'}}>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>{loadout.name}</Text>
          <View style={{flexDirection:'row', alignItems: 'center', justifyContent:"space-around", width: "95%", marginBottom:20}}>
          
          <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame((loadout.relics)[0])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon((loadout.relics)[0])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame((loadout.relics)[1])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon((loadout.relics)[1])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame((loadout.relics)[2])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon((loadout.relics)[2])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame((loadout.relics)[3])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon((loadout.relics)[3])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame((loadout.relics)[4])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon((loadout.relics)[4])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame((loadout.relics)[5])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon((loadout.relics)[5])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame((loadout.relics)[6])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon((loadout.relics)[6])}
        />
            </View>

          </View>

          </View>
        </TouchableOpacity>
          )))}
          <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View style={{alignItems:'center'}}>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Create a New Loadout</Text>
          
          <TouchableOpacity style={{
              alignContent:'center',
              width:'60%',
              marginBottom: 20
            }} onPress={createLoadout}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Add New</Text>

              </View>
            </TouchableOpacity>

          </View>
        </View>

          </View>
          </ScrollView>
          </View>

          <TouchableOpacity style={{height:'50%', flex:1, alignItems:'center', justifyContent:'center'}} onPress={() => setModal2Visible(false)}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'80%',
                width:"80%",
                opacity: 0.8,
                alignSelf: 'center',
                backgroundColor: COLORS.gray,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Cancel</Text>

              </View>
           </TouchableOpacity>

        </View>
      </View>

    </Modal>
    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.95), height: (height*0.9), justifyContent:"space-around", padding:0}]}>
          <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          marginTop: 20,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View style={{alignItems:'center', width:'100%'}}>
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, marginTop:10, fontSize: 18, alignItems:'center'}]}>Your Relics:</Text>
          <View style={{
            width:'100%',
            height:'auto',
            marginTop:10,
            marginBottom:10
          }}>
            
          <ScrollView horizontal={true}> 
          <View style={{flexDirection:'row', alignItems: 'center', justifyContent:"space-around", width: "100%"}}>
          {relicSelection.map((relic, index) => ((
          <TouchableOpacity style={{
            width: (width*0.9*0.9*0.9/4-15),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }} key={index} onPress={() => select(relic)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(relic)}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(relic)}
        />
            </TouchableOpacity>
          )))}

          </View>
          </ScrollView>
          </View>
          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 3,
          marginTop: 20,
          marginBottom: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'space-around',
          alignItems:'center'
        }]}>
        <View style={{flex:1, justifyContent:'center'}}>
        <Text style={[styles.sectionHeader, {alignSelf:'flex-start',marginStart: 0, fontSize:25, fontStyle: 'italic'}]}>{Relic.name(selectedRelic)}</Text>
        </View>
        <View style={{flexDirection:"row", flex:3}}>
         
        <View style={{
            aspectRatio:1,
            height:'90%',
            justifyContent:'center',
            overflow:'hidden',
            margin:2
          }}>
          
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(selectedRelic)}
        />

          </View>
          <View style={{flex:1, justifyContent:'center'}}>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:15}]}>{Relic.desc(selectedRelic)}</Text>
        </View>

        </View>
        <View style={{
            flex:1, flexDirection:'row', alignItems:'center'
          }}>
           <TouchableOpacity style={{height:'100%', flex:1, alignItems:'center', justifyContent:'center'}} onPress={() => swap(selectedRelic)}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'80%',
                width:"50%",
                alignSelf: 'center',
                backgroundColor: COLORS.gray,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  height:20,
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>{swapType}</Text>

              </View>
           </TouchableOpacity>
          </View>
        
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View style={{alignItems:'center', width:'100%'}}>
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, marginTop:10, fontSize: 18, alignItems:'center'}]}>New Loadout:</Text>
          <View style={{
            width:'100%', height: (width*0.9*0.9*0.9*0.9/4-15),
            marginTop:10,
            marginBottom:10
          }}>
            
          <ScrollView horizontal={true}> 
          <View style={{flexDirection:'row', alignItems: 'center', justifyContent:"space-around", width: "100%"}}>
          {newLoadout.map((relic, index) => ((
          <TouchableOpacity style={{
            width: (width*0.9*0.9*0.9/4-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }} key={index} onPress={() => select(relic)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(relic)}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(relic)}
        />
            </TouchableOpacity>
          )))}

          </View>
          </ScrollView>
          </View>
          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 2,
          width: '90%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center',
          marginTop: 20,
          marginBottom: 20,
        }]}>
          <View style={{flex:1, alignItems:'center', width:'100%', justifyContent:'space-between'}}>
          <View style={{flex:1}}>
            
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize: 20, alignItems:'center'}]}>Name Your Loadout</Text>
          <View style={[styles.startInputArea, {backgroundColor:COLORS.gray2}]}>
          <TextInput 
            style={styles.startInput}
            onChangeText={title => setNewLoadTitle(title)}
            value= {newLoadTitle}
            placeholder={("Loadout" + d.getTime())}
          />
        </View>
          </View>
        <View style={{
            flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center'
          }}>
           <TouchableOpacity style={{height:'60%', flex:2, alignItems:'center', justifyContent:'center'}} onPress={() => finishLoadout()}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'100%',
                width:"80%",
                alignSelf: 'center',
                backgroundColor: COLORS.wizBlue,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Create</Text>

              </View>
           </TouchableOpacity>

           <TouchableOpacity style={{height:'50%', flex:1, alignItems:'center', justifyContent:'center'}} onPress={() => setModalVisible(false)}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'80%',
                width:"80%",
                opacity: 0.8,
                alignSelf: 'center',
                backgroundColor: COLORS.gray,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Cancel</Text>

              </View>
           </TouchableOpacity>
          </View>
          
          </View>
        </View>
          </View>
        </View>
      </Modal>
    
      <View style={{
        flex: 10,
        margin:5,
        flexDirection: "row",
        justifyContent:'flex-start'
      }}>
        <Image
            style={{  width: 50, height: '100%', alignSelf:"flex-start"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
        />

        <View style={{
        margin:10,
        flexDirection: "column",
        justifyContent:'space-around'
      }}>
        <Text
            style={styles.pageTopText}
        >{currentUser.getUsername()}</Text>

        <Text
            style={styles.pageTopText}
        >Level: {currentUser.getLevel()}</Text>

        <Progress.Bar style={{color:'#FFFFFF'}} progress={xpProgress} color='#FFFFFF' width={200} />

      </View>
{/* Navigation drawer add*/}
      </View>

      <View style={{ 
        flex: 1,
        flexDirection: "row",
        backgroundColor:COLORS.dark1
      }}>
        
      </View>

      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
      <TouchableOpacity
          style={{alignSelf:'left', position:'absolute'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:35}]}>Quick Duel</Text>

        <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center'}}>
          
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View>
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, marginTop:10, fontSize: 20}]}>You will compete against:</Text>
          <View style={{flexDirection:'row'}}>
          <Image
            style={{  width: 80, height: 80, alignSelf:"flex-start"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
        />
        <Text style={[styles.sectionHeader, {alignSelf:'center', marginStart: 0, fontSize: 15}]}>{oppText}</Text>
          </View>

          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View style={{alignItems:'center'}}>
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, marginTop:10, fontSize: 20, alignItems:'center'}]}>Match Settings:</Text>
          <View style={{flexDirection:'row', alignItems: 'center'}}>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Casual</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={ranked ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        disabled={rankLock}
        onValueChange={() => setRanked(previousState => !previousState)}
        value={ranked}
      />
      <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Ranked</Text>
          </View>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Rank Wager</Text>
          <View style={{flexDirection:'row', alignItems: 'center'}}>
          <Slider 
              style={{width:'50%', height: 25}}
              maximumValue={10}
              minimumValue={1}
              minimumTrackTintColor={COLORS.wizBlue}
              maximumTrackTintColor="#222222"
              step={1}
              onValueChange={(wager) => setWager(wager)}
            />
      <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>{wager} Points</Text>
          </View>

          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View style={{alignItems:'center'}}>
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, marginTop:10, fontSize: 20, alignItems:'center'}]}>Selected Loadout:</Text>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>{loadTitle}</Text>
          <View style={{flexDirection:'row', alignItems: 'center', justifyContent:"space-around", width: "95%"}}>
          
          <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(loadout[0])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(loadout[0])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(loadout[1])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(loadout[1])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(loadout[2])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(loadout[2])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(loadout[3])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(loadout[3])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(loadout[4])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(loadout[4])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(loadout[5])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(loadout[5])}
        />
            </View>

            <View style={{
            width: (width*0.90/7-5),
            aspectRatio:1,
            justifyContent:'space-around',
            overflow:'hidden',
            justifyContent:'center'
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={Relic.frame(loadout[6])}
        />
        <Image
            style={{  width: "500%", height: "500%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={Relic.icon(loadout[6])}
        />
            </View>

          </View>
          <TouchableOpacity style={{
              alignContent:'center',
              width:'60%',
              marginBottom: 20
            }} onPress={() => setModal2Visible(true)}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Change</Text>

              </View>
            </TouchableOpacity>

          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: "auto",
          marginTop: 20,
          marginBottom: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center',
          alignItems: 'center'
        }]}>
          <View style={{alignItems:'center'}}>
          
          <TouchableOpacity style={{
              alignContent:'center',
              width:'60%',
              marginBottom: 20
            }} onPress={() => queueUp()}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>READY</Text>

              </View>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

      </View>

    </SafeAreaView>
  )
}

export default DuelPrep;