import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal, Switch, KeyboardAvoidingView, Platform} from 'react-native';
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
import {ref, set, get, child, onValue, push} from 'firebase/database';

const GroupView = ({route}) => {
    const { currentUser, group } = route.params;
    const navigation = useNavigation();
    const { width, height } = Dimensions.get('window');
    const scrollViewRef = React.useRef(null);

  const [loadedGroup, setLoadedGroup] = React.useState(group);
  const [messages, setMessages] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [numConnected, setNumConnected] = React.useState(0);
  const [numTyping, setNumTyping] = React.useState(0);

  const [modalVisible , setModalVisible ] = React.useState(false);
  const [modal2Visible, setModal2Visible] = React.useState(false);
  const [modal3Visible, setModal3Visible] = React.useState(false);
  const [modal4Visible, setModal4Visible] = React.useState(false);
  const [modal5Visible, setModal5Visible] = React.useState(false);
  const [modal6Visible, setModal6Visible] = React.useState(false);
  
  const [pfpUrls, setpfpUrls] = React.useState([]);


  const groupRef = ref(database, "groups/" + loadedGroup.groupID)

  const fetchPFPIcons = async () => {
    const iconUrls = await Promise.all(Object.values(loadedGroup.members || {}).map(async (member) => {
        const ref = firebase.storage().ref(`images/users/${member}`).child('pfp');
        try {
          const url = await ref.getDownloadURL();
          console.log(member)
          return url;
        } catch (e) {
          console.log('User has no pfp: ', e);
          return null;
        }
    }));
    setpfpUrls(iconUrls);
  };

  React.useEffect(() => {
    const fetchData = async () => {
        console.log("loading group");
        const theD = await get(ref(database, "groups/" + group.groupID));
        if (theD.exists()) {
            setLoadedGroup(theD.val());
            setMessages(sortMessages(Object.values(theD.val().messages || {})));
            console.log("group loaded");
        } else {
            console.log("group doesn't exist");
        }
    };

    fetchData();

    const unsubscribe = onValue(groupRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            setMessages(sortMessages(Object.values(data.messages || {})));
            console.log("messages updated");
        }
    });

    return () => unsubscribe();
    }, []);

    const scrollToBottom = () => {
    if(scrollViewRef.current != null){
        scrollViewRef.current.scrollToEnd({ animated: true });
    }
};

React.useEffect(()=>{
    const timeoutId = setTimeout(() => {
        scrollToBottom()
    },500)

    return () => clearTimeout(timeoutId)
}, [messages]);

const acceptJoin = async (request, key) => {
    if(Object.values(loadedGroup.admins || {}).includes(currentUser.getUsername())){
        console.log(key)
    const currentreq = await get(ref(database, "groups/" + loadedGroup.groupID + "/inbox/" + key))
    const userDis = await get(ref(database, "users/" + request.from + "/groups"))
    if(currentreq.exists() && userDis.exists() && (Object.values(userDis.val() || {}).filter((group) =>{group.name == loadedGroup.name}).length == 0)){
      if(request.accepted == false && request.rejected == false) {
        set(ref(database, "groups/" + loadedGroup.groupID + "/inbox/" + key + "/accepted"), true)
    .then(()=>{
      set(ref(database, "users/" + request.from + "/outPending/" + key + "/accepted"), true)
      .then(()=>{
        set(ref(database, "users/" + request.from + "/groups/" + key), loadedGroup)
          .then(()=>{
            set(push(ref(database, "groups/" + loadedGroup.groupID + "/members")), request.from)
            .then(()=> {
              alert(("New Member: " + request.from))
            })
          })
      })
    })
      }
    }else{
      alert(("Outdated request"))
      console.log(key)
    }
    }else{
        alert(("You do not have permission to complete this action!"))
    }
    
  }

  const declineJoin = async (request, key) => {
    if(Object.values(loadedGroup.admins || {}).includes(currentUser.getUsername())){
        const currentreq = await get(ref(database, "groups/" + loadedGroup.groupID + "/inbox/" + key))
    if(currentreq.exists()){
      if(request.accepted == false && request.rejected == false) {
        set(ref(database, "groups/" + loadedGroup.groupID + "/inbox/" + key + "/rejected"), true)
    .then(()=>{
      set(ref(database, "users/" + request.from + "/outPending/" + key + "/rejected"), true)
      alert(("Rejected " + request.from))
    })
      }
    }else{
      alert(("Outdated request"))
    }
    }else{
        alert(("You do not have permission to complete this action!"))
    }
    
  }

const sortMessages = (messages) => {
    return messages.sort((a, b) => a.timestamp - b.timestamp);
};

const sendMessage = async () => {
    if (message.trim() === "") {
        return;
    }

    const newMessage = {
        user: currentUser.getUsername(),
        icon: currentUser.getPfp(),
        text: message.trim(),
        timestamp: Date.now()
    };

    const newMessageRef = push(child(groupRef, "messages"));
    await set(newMessageRef, newMessage);

    setMessage("");
    scrollToBottom();
};

  return (
    <KeyboardAvoidingView style={{
        flex: 1,
        display:'flex',
        backgroundColor: COLORS.dark,
        alignItems: 'center'
      }} behavior="padding">
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75), height: (height*0.7), padding: 20}]}>
            <Text style={[styles.header1,{fontSize: 20, color: COLORS.white, fontWeight: 700}]}>Members of {loadedGroup.name}:</Text>
            <ScrollView style={{width: "100%", marginBottom: 20,marginTop: 20}}>
            {Array.isArray(Object.values(loadedGroup.members || {})) && Object.values(loadedGroup.members || {}).map((member, index) => (
              <View style={{width: '100%', height: 50, flexDirection: 'row', alignItems:'center'}} key={index}>
              <Text style={[styles.header1,{fontSize: 16, color: 'gray', marginEnd: 20}]}>{index+1}</Text>
              {!pfpUrls[index] && <Image
                style={{ width: 35, aspectRatio: 1, alignSelf: "center", borderRadius: width, borderColor: COLORS.white, borderWidth: 1, marginEnd: 10}}
                tintColor={COLORS.white}
                source={require('../constants/images/UIcons/icons8-person-64.png')}
                resizeMode="contain"
                />}
                {pfpUrls[index] && <Image
                style={{ width: 35, aspectRatio: 1, alignSelf: "center", borderRadius: width, borderColor: COLORS.white, borderWidth: 1, marginEnd: 10}}
                source={{uri: pfpUrls[index]}}
                resizeMode="contain"
                />}
              <Text style={[styles.header1,{fontSize: 16, color: COLORS.white}]}>{member}</Text>
              </View>
            ))}
            </ScrollView>
            
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModalVisible(false)}>
              
                <Text style={{
                  color: 'gray', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center',
                  marginTop:20
                }}>Cancel</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modal6Visible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModal6Visible(!modal6Visible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75), height: (height*0.7), padding: 10}]}>
            <Text style={[styles.header1,{fontSize: 20, color: COLORS.white, fontWeight: 700}]}>Inbox:</Text>
            <ScrollView style={{width: "100%", marginBottom: 20,marginTop: 20}}>
            {Array.isArray(Object.values(loadedGroup.inbox || {})) && Object.values(loadedGroup.inbox || {}).map((mail, index) => (
              (mail.type == "groupJoinRequest" && (mail.accepted == false && mail.rejected == false) && <View style={{width: '100%', height: 120, alignItems:'space-evenly', justifyContent:'space-evenly', backgroundColor: "#4D4C4CAA", paddingStart: 10, paddingEnd: 10, borderRadius: 15}} key={index}>
                <View style={{width: '100%', height: 50, flexDirection: 'row', alignItems:'center'}}>
              <Text style={[styles.header1,{fontSize: 16, color: 'gray', marginEnd: 20}]}>{index+1}</Text>
              <Image
                                    style={{ width: 35, aspectRatio: 1, alignSelf: "center", borderRadius: width, borderColor: COLORS.white, borderWidth: 1, marginEnd: 10}}
                                    tintColor={COLORS.white}
                                    source={require('../constants/images/UIcons/icons8-person-64.png')}
                                    resizeMode="contain"
                                />
              <View style={{height: "100%", justifyContent: 'space-evenly'}}>
              <Text style={[styles.header1,{fontSize: 16, color: COLORS.white}]}>{mail.from}</Text>
              <Text style={[styles.header1,{fontSize: 16, color: COLORS.white}]}>Level: {mail.level}</Text>
              <Text style={[styles.header1,{fontSize: 12, color: COLORS.white}]}>would like to join this group</Text>
              </View>
              </View>
              <View style={{width: '100%', height: 30, flexDirection: 'row', alignItems:'center', justifyContent:'space-evenly'}}>
              <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: "100%",
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center',
                justifyContent: 'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>View Profile</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{acceptJoin(mail, Object.keys(loadedGroup.inbox || {})[index])}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: "100%",
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.green,
                flexDirection:'row',
                alignContent:'center',
                justifyContent: 'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>Accept</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{declineJoin(mail, Object.keys(loadedGroup.inbox || {})[index])}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: "100%",
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.red,
                flexDirection:'row',
                alignContent:'center',
                justifyContent: 'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>Decline</Text>

              </View>
            </TouchableOpacity>
              </View>
              </View>)
            ))}
            </ScrollView>
            
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModal6Visible(false)}>
              
                <Text style={{
                  color: 'gray', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center',
                  marginTop:20
                }}>Cancel</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        <View style={[ styles.sectionShadow , {
          borderRadius: 0,
          height: 150,
          width: '100%',
          backgroundColor: COLORS.dark2
        }]}>
        <TouchableOpacity
          style={{alignSelf:'flex-start'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
          <View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center'
          }}>
          <View style={{flex: 3, flexDirection: 'row'}}>
          <View style={{alignItems: "center", justifyContent: "center", flex: 1, height: 'auto', flexDirection:'row'}}>
          <Image
            style={{  width: '90%', aspectRatio: 1, alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 5}}>
            <Text style={[styles.header1, {fontSize: 28, color: COLORS.white, fontWeight: 700, marginBottom: 5}]}>{loadedGroup.name}</Text>
            <Text style={[styles.header1, {fontSize: 14, color: COLORS.white, fontWeight: 400, marginBottom: 20}]}>{loadedGroup.description}</Text>
          </View>
          <View style={{alignItems: "center", justifyContent: "center", flex: 1, flexDirection:'row'}}>
          <Image
            style={{  width: '90%', aspectRatio: 1, alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
          </View>
          </View>
          </View>
        </View>
        <ScrollView ref={scrollViewRef} style={{
            width:'100%'
        }} contentContainerStyle={{

        }}>
        {Array.isArray(messages) && messages.map((msg, index) => (
                    <View key={index} style={{ width: '90%', alignItems: 'flex-start', margin: 10, alignSelf:(msg.user == currentUser.getUsername() ? 'flex-end' : 'flex-start')}}>
                        <Text style={{
                            color: 'white',
                            fontSize: 10,
                            alignContent: 'flex-start',
                            marginBottom: 2,
                            alignSelf:(msg.user == currentUser.getUsername() ? 'flex-end' : 'flex-start'),
                            textAlign: 'left',
                        }}>{msg.user}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' , width: width-60, alignSelf:(msg.user == currentUser.getUsername() ? 'flex-end' : 'flex-start'), justifyContent: (msg.user == currentUser.getUsername() ? 'flex-end' : 'flex-start')}}>
                            {(msg.user != currentUser.getUsername()) && <View style={{ alignItems: "flex-end", justifyContent: "center", width: 30, height: 30, borderRadius: (width), borderWidth: 1, borderColor: COLORS.white, padding: 1 }}>
                                {!msg.icon && <Image
                                    style={{ height: '100%', aspectRatio: 1, alignSelf: "center", borderRadius: width }}
                                    tintColor={COLORS.white}
                                    source={require('../constants/images/UIcons/icons8-person-64.png')}
                                    resizeMode="contain"
                                />}
                                {msg.icon && <Image
                                    style={{ height: '100%', aspectRatio: 1, alignSelf: "center", borderRadius: width }}
                                    source={{uri: msg.icon}}
                                    resizeMode="contain"
                                />}
                            </View>}
                            <Text style={{
                                color: 'white',
                                fontSize: 13,
                                alignContent: 'flex-start',
                                marginStart: (msg.user == currentUser.getUsername() ? 30 : 10),
                                marginEnd: (msg.user == currentUser.getUsername() ? 10 : 30),
                                marginTop: 5,
                                alignSelf: 'flex-start',
                                textAlign: (msg.user == currentUser.getUsername() ? 'right' : 'left') ,
                            }}>{msg.text}</Text>
                            {(msg.user == currentUser.getUsername()) && <View style={{ alignItems: "flex-end", justifyContent: "center", width: 30, height: 30, borderRadius: (width), borderWidth: 1, borderColor: COLORS.white, padding: 1 }}>
                            {!msg.icon && <Image
                                    style={{ height: '100%', aspectRatio: 1, alignSelf: "center", borderRadius: width }}
                                    tintColor={COLORS.white}
                                    source={require('../constants/images/UIcons/icons8-person-64.png')}
                                    resizeMode="contain"
                                />}
                                {msg.icon && <Image
                                    style={{ height: '100%', aspectRatio: 1, alignSelf: "center", borderRadius: width }}
                                    source={{uri: msg.icon}}
                                    resizeMode="contain"
                                />}
                            </View>}
                        </View>
                    </View>
                ))}
        </ScrollView>
        <View style={[ styles.sectionShadow , {
          borderRadius: 0,
          height: 220,
          width: '100%',
          backgroundColor: COLORS.dark2
        }]}>
        
        <View style={{marginBottom:15, width: '100%', marginTop:10, flexDirection: 'row', justifyContent: 'center'}}>
        <TextInput
        style={{backgroundColor: COLORS.dark2, borderRadius: 20,paddingHorizontal: 20, height:50, width:"80%", borderColor: COLORS.gray1, borderWidth: 2, paddingEnd: 60}}
        placeholder={("Message " + loadedGroup.name + "...")}
        value={message}
        onChangeText={orgSearch => setMessage(orgSearch)}
        placeholderTextColor={COLORS.gray1}
        color={COLORS.white}
        />
        <TouchableOpacity style={{width:50,height:50,backgroundColor: COLORS.wizLBlue, borderRadius:20, alignItems: 'center', justifyContent: 'center', marginLeft: -50}} onPress={sendMessage}>
        <Image
            style={{  width: '50%', height: '50%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-send-96.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>  
        </View>
        <View style={{
            borderRadius: 20,
          height: 80,
          marginTop: 20,
          width: '100%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignSelf: 'center'
        }}>
            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]} onPress={() => {fetchPFPIcons(); setModalVisible(true)}}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                
                    <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Members
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '50%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                    <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Options
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '50%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-list-96.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                
                    <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Settings
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '50%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/settings-5666.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]} onPress={()=>{setModal6Visible(true)}}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                    <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Inbox
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '50%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-mail-96.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>
        </View>
        </View>
      

    </KeyboardAvoidingView>
  )
}

export default GroupView