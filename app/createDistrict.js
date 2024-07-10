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

import postTypes from "./lists/postTypes";
import subjects from "./lists/subjects";
import topicMathSpinner from "./lists/mathTopics";
import topicScienceSpinner from "./lists/scienceTopics";
import topicSocialStudiesSpinner from "./lists/ssTopics";
import topicEnglishSpinner from "./lists/englishTopics";
import topicBaESpinner from "./lists/baeTopics";
import topicEngineeringSpinner from "./lists/engineeringTopics";
import topicProgrammingSpinner from "./lists/programmingTopics";
import topicOtherSpinner from "./lists/otherTopics";
import noTopics from "./lists/noTopics";
import tags from "./lists/tags";
import dtags from "./lists/districtTags";

import badWordChecker from "./functions/badWordChecker";
import scanContent from "./functions/scanContent";
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

import Post from "./objects/postObj";
import {Profile} from './objects/profileObj';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set} from 'firebase/database';


const CreateDistrict = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');

  const [titleInput, onTitleUpdate] = React.useState('');
  const [descInput, onDescUpdate] = React.useState('');
  
  const nullImage = require('../constants/images/UIcons/photos-10614.png');
  const [image, onImagesUpdate] = React.useState([nullImage]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [postType, setPostType] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [topicData, setTopicData] = React.useState(noTopics);
  const [topic, setTopic] = React.useState("");

  const [postPrivate, setPostPrivate] = React.useState(false);
  const [official, setOfficial] = React.useState(false);
  const [invite, setInvite] = React.useState(false);
  const [max, setMax] = React.useState(-1);
  const [badInput, setBadInput] = React.useState(false);
  const [restricted, setRestricted] = React.useState(false);
  const [allowedAccounts, setAllowedAccounts] = React.useState(["Student", "Educator", "Personal"]);
  const [levelReq, setLevelReq] = React.useState(0);
  const [badInput2, setBadInput2] = React.useState(false);

  const [tags1, setTags1] = React.useState("");
  const [tags2, setTags2] = React.useState("");
  const postTags = [];
  var districtJSON = {
    "name": "",
    "description": "",
    "tags": [],
    "owner": "",
    "settings": {
        "private": false,
        "maxMembers": -1,
        "allowedAccounts": [],
        "levelReq": 0,
        "official": false,
        "verified": false,
        "inviteOnly": false
    },
    "members": [],
    "admins": [],
    "districtID": "",
    "hasIcon": false,
    "level": 0,
    "xp": 0
  }


  const toggleSwitch = () => setPostPrivate(previousState => !previousState);
  const toggleSwitch1 = () => setOfficial(previousState => !previousState);
  const toggleSwitch2 = () => setInvite(previousState => !previousState);
  const toggleSwitch3 = () => {
    if(max == -1){
        setMax(0)
    }else{
        setMax(-1)
    }
  };
  const toggleSwitch4 = () => {
    if (restricted){
        setAllowedAccounts(["Student", "Educator", "Personal"])
    }
    setRestricted(previousState => !previousState)
  };
  const toggleSwitch5 = () => {
    if(levelReq == 0){
        setLevelReq(1)
    }else{
        setLevelReq(0)
    }
  };
  const toggleAccount = (accountType) => {
    setAllowedAccounts((prev) => {
      if (prev.includes(accountType)) {
        return prev.filter((account) => account !== accountType);
      } else {
        return [...prev, accountType];
      }
    });
  };

  const toggleStudent = () => toggleAccount("Student");
  const toggleEducator = () => toggleAccount("Educator");
  const togglePersonal = () => toggleAccount("Personal");

  function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseInt(str)) // ...and ensure strings of whitespace fail
  }
  const memberCount = (input) => {
    if (isNumeric(input) && parseInt(input) > 0){
        setMax(parseInt(input))
        return true;
    }else{
        return false;
    }
  }
  const levelReqCheck = (input) => {
    if (isNumeric(input)){
        setLevelReq(parseInt(input))
        return true;
    }else{
        return false;
    }
  }
  

  const create = async () => {
    console.log('Checking...');
    if (!titleInput.trim()) {
      alert('Please enter a name for your district');
      return;
    }
    if (titleInput.trim() == "Rogue Student" || titleInput.trim() == "The Admins" || titleInput.trim() == "Wizdrif" || titleInput.trim() == "Ghosts of Deletion") {
        alert('That district name is restricted!');
        return;
    }
    if (titleInput.length > 75 || titleInput.length < 5) {
      alert('District Name must be between 5-75 characters');
      return;
    }
    if (!descInput.trim()) {
      alert('Please enter a description for your district');
      return;
    }
    if (descInput.length > 600) {
      alert('Maximum description length of 600 characters');
      return;
    }
    if(official && currentUser.getAccount() != 2){
        alert('Only educators may create an official school district.');
        return;
    }
    if (!badWordChecker(titleInput) || !badWordChecker(descInput)) {
      alert('Your fields contains inappropriate language');
      return;
    }
    if (max < 2) {
        alert('Maximum member limit must exceed 1!');
        return;
    }
    if(levelReq > currentUser.getLevel()){
      alert('Level Requirement cannot exceed your own level!');
      return;
    }
    if(currentUser.getAccount() == 1 && !allowedAccounts.includes("Student") || currentUser.getAccount() == 2 && !allowedAccounts.includes("Educator") || currentUser.getAccount() == 3 && !allowedAccounts.includes("Personal")){
        alert('You cannot restrict your own account type!');
      return;
    }
  
    // Perform content scanning
    if (image[0] != nullImage){
      for(let i = 0; i < image.length; i++) {
        const uri = image[i].uri;
        console.log('Localizing...');
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const { uri: localUri } = fileInfo;
        console.log('Encoding...');
        const imageBase64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
        const octetStream = base64ToOctetStream(imageBase64);
        console.log('Calling...');
        const isContentSafe = await scanContent(octetStream);
    if (!isContentSafe) {
      alert('Your photo contains inappropriate content. Attempting to upload this content will disable your account.');
      return;
    } 
      }
    }
    console.log('Proceeding...');
    
    if(tags1){
      districtJSON.tags.push(tags1);
    }
    if(tags2 && tags1 != tags2){
        districtJSON.tags.push(tags2);
    }
    console.log('District Name:', titleInput);
    console.log('Description:', descInput);
    console.log('Private:', postPrivate);
    console.log('Images:', (image[0] != nullImage));
    console.log('Tags:', postTags.length);

    uploadPost();
  
    // confirmPostCreation
  };

  const uploadPost = async () =>{
    let d = new Date();
    let districtID = "district" + d.getTime() + "=" + currentUser.getUsername();
    districtJSON.name = titleInput.trim();
    districtJSON.description = descInput.trim();
    districtJSON.owner = currentUser.getUsername();
    districtJSON.settings.private = postPrivate;
    districtJSON.settings.maxMembers = max;
    districtJSON.settings.allowedAccounts = allowedAccounts;
    districtJSON.settings.levelReq = levelReq;
    districtJSON.settings.official = official;
    districtJSON.settings.inviteOnly = invite;
    districtJSON.members = [currentUser.getUsername()];
    districtJSON.admins = [currentUser.getUsername()];
    districtJSON.districtID = districtID;
    
    districtJSON.hasIcon = true;
    if (image[0] == nullImage){
      districtJSON.hasIcon = false;
    }


    const userPostRef = ref(database, 'users/' + currentUser.getUsername()+ "/district");
    const pubPostRef = ref(database, 'districts/' + districtID);
    set(userPostRef, districtJSON) //Publishing to user post reference
    .then(async() => {
        currentUser.setDistrict(titleInput)
      console.log('District successfully saved to user reference');

      if (image[0] != nullImage){ //Uploading images
        for(let i = 0; i < image.length; i++) {
          const { uri } = await FileSystem.getInfoAsync(image[i].uri);
          const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
              resolve(xhr.response);
            };
            xhr.onerror = (e) => {
              reject(new TypeError('Network request failed.'))
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
          });

          const ref = firebase.storage().ref('images/districts/' + districtID + '/coverIcon');

          await ref.put(blob);
        }
      }
      if(true){ 
        set(pubPostRef, districtJSON) //Publishing to public posts reference
        .then(async() => {
          alert('District created successfully to Wizdrif server');
        })
        .catch((error) => {
          console.error('Error making district data public:', error);
        });
      }
    })
    .catch((error) => {
      console.error('Error creating district:', error);
    });
  }

  const base64ToOctetStream = (base64String) => {
    const octetStream = new Uint8Array(Buffer.from(base64String, 'base64'));
    return octetStream;
  };

  const topicSelector = (subject) => {
    setSubject(subject);
    if (subject == 'Math'){
      setTopicData(topicMathSpinner);
    } else if (subject == 'Science'){
      setTopicData(topicScienceSpinner);
    } else if (subject == 'Social Studies'){
      setTopicData(topicSocialStudiesSpinner);
    } else if (subject == 'English'){
      setTopicData(topicEnglishSpinner);
    } else if (subject == 'Business and Economics'){
      setTopicData(topicBaESpinner);
    } else if (subject == 'Engineering'){
      setTopicData(topicEngineeringSpinner);
    } else if (subject == 'Programming'){
      setTopicData(topicProgrammingSpinner);
    } else if (subject == 'Other'){
      setTopicData(topicOtherSpinner);
    } else {
      setTopicData(noTopics);
    }
  }

  const takePhoto = async() => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    
    if (!result.canceled) {
      imagesUpdate(result.assets[0].uri);
    }
  }

  const choosePhotos = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    console.log(result);
    
    if (!result.canceled) {
      imagesUpdate(result.assets[0]);
    }
  }

  const imagesUpdate = (imageUri) => {
    if (image[0] == nullImage && imageUri != null){
      image.pop();
      image.push(imageUri);
    } else if (image.length != 1 && imageUri != null){
      image.push(imageUri);
    } else if (imageUri == null){
      image.pop();
      if (image.length == 0){
        image.push(nullImage)
      }
    }
    onImagesUpdate([...image]);
  }
  
  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
    
      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
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
        <Text style={styles.sectionHeader}>Create a District</Text>
        <ScrollView contentContainerStyle={{alignItems: 'center'}}>
        
        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
            <Text style={{
              color: 'white', 
        fontSize: 25, 
        fontWeight: 'bold',
        alignContent: 'center',
        marginTop:10,
        alignSelf: 'center',
        textAlign:'center'
            }}>Add Photos</Text>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={takePhoto}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
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
                }}>Take Photo</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={choosePhotos}>
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
                }}>Use Gallery</Text>

              </View>
            </TouchableOpacity>
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

      <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2, zIndex:-5
        }]}>
          <Text style={styles.fieldDesc}>District Name</Text>
          <View style={[styles.field, {marginBottom: 10}]}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={titleInput => onTitleUpdate(titleInput)}
            defaultValue= {titleInput}
          />
          </View>
        </View>

        <View style={[{
          borderRadius: 20,
          height: 60,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          alignItems:'center',
          justifyContent:'center'
        }, styles.sectionShadow]}>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Public</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={postPrivate ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch}
        value={postPrivate}
      />
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Private</Text>
        </View>

        <View style={[{
          borderRadius: 20,
          height: 60,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          alignItems:'center',
          justifyContent:'center'
        }, styles.sectionShadow]}>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Unofficial</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={official ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch1}
        value={official}
      />
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Official School District</Text>
        </View>

        <View style={[{
          borderRadius: 20,
          height: 60,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          alignItems:'center',
          justifyContent:'center'
        }, styles.sectionShadow]}>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Anyone Can Join</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={invite ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch2}
        value={invite}
      />
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Invite-only</Text>
        </View>

        

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2, zIndex:-5
        }]}>

          <Text style={styles.fieldDesc}>Add Description</Text>
          <View style={[styles.field, {height:90}]}>
          <TextInput 
            style={[styles.startInput,{width: (width*0.95*0.95), height:'auto', color:COLORS.white}]}
            onChangeText={descInput => onDescUpdate(descInput)}
            defaultValue= {descInput}
            multiline={true}
          />
          </View>

          <Text style={styles.fieldDesc}>Tag #1</Text>
          <View style={[styles.field]}>
          <SelectList
        setSelected={(tag) => setTags1(tag)} 
        data={dtags} 
        save="value"
        labelStyles={{
          color:COLORS.white
        }}
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:6,
        }}
    />
          </View>

          <Text style={styles.fieldDesc}>Tag #2</Text>
          <View style={[styles.field, {zIndex:-3,marginBottom:20}]}>
          <SelectList
        setSelected={(tag) => setTags2(tag)} 
        data={dtags} 
        save="value"
        labelStyles={{
          color:COLORS.white
        }}
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:6,
        }}
    />
          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          zIndex: -10
        }]}>
        <View style={{flexDirection:'row'}}>
        <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Set a maximum member count</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={(max > -1) ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch3}
        value={(max > -1)}
      />
        </View>
        {(badInput) && (max > -1) && <Text style={[styles.fieldDesc, {color: COLORS.red}]}>Enter a valid integer greater than 0</Text>}
        {(max > -1) && <View style={[styles.field, {marginBottom: 10, borderWidth: (badInput ? 2 : 0) , borderColor: (badInput ? COLORS.red : COLORS.white)}]}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={max => {
                if(!memberCount(max)){
                    setBadInput(true)
                }else{
                    setBadInput(false)
                }
            }}
            defaultValue= {max.toString()}
          />
          </View>}
        <View style={{flexDirection:'row'}}>
        <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Account Type Restrictions</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={restricted ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch4}
        value={restricted}
      />
        </View>
        {(restricted) && <Text style={[styles.fieldDesc, {margin: 0, marginLeft: 20}]}>Allow these account types to join:</Text>}
        {(restricted) && <View style={[{flexDirection:'row'}]}>
        <TouchableOpacity style={[styles.safeContain, {flex:1, opacity: (allowedAccounts.includes("Student") ? 1 : 0.3)}]} onPress={toggleStudent}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.gray2,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>Student</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.safeContain, {flex:1, opacity: (allowedAccounts.includes("Educator") ? 1 : 0.3)}]} onPress={toggleEducator}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.gray2,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>Educator</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.safeContain, {flex:1, opacity: (allowedAccounts.includes("Personal") ? 1 : 0.3)}]} onPress={togglePersonal}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.gray2,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>Personal</Text>

              </View>
            </TouchableOpacity>
          </View>}
        <View style={{flexDirection:'row'}}>
        <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Level Requirement</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={(levelReq > 0) ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch5}
        value={(levelReq > 0)}
      />
        </View>
        {(levelReq > 0) && (badInput2) && <Text style={[styles.fieldDesc, {color: COLORS.red}]}>Enter a valid integer</Text>}
        {(levelReq > 0) && <View style={[styles.field, {marginBottom: 10, borderWidth: (badInput2 ? 2 : 0) , borderColor: (badInput2 ? COLORS.red : COLORS.white)}]}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={levelReq => {
                if(!levelReqCheck(levelReq)){
                    setBadInput2(true)
                }else{
                    setBadInput2(false)
                }
            }}
            defaultValue= {levelReq.toString()}
          />
          </View>}
          
        </View>

        <View style={{ 
        height: 10,
        marginTop: 20,
        width:'100%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1,
        zIndex: -10
        }}/>

        <Text style={[styles.subSectionHeader,{zIndex: -10}]}>Add District Photo</Text>
        <View style={{
            width: '100%',
            alignSelf:'center',
            flexDirection: 'row',
            alignContent:'center',
            justifyContent:'flex-end'
          }}>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => setModalVisible(true)}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                shadowColor: COLORS.wizLBlue,
                shadowRadius:10,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>Attach Image</Text>

              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => imagesUpdate(null)}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                shadowColor: COLORS.wizPurp,
                shadowRadius:10,
                flexDirection:'row'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>Remove</Text>
              </View>
            </TouchableOpacity>
        </View>

        

<View style={{
            width: '90%',
            height: 200,
            marginTop:10,
            marginBottom:10,
            borderRadius: 10,
            borderWidth:5,
            borderColor: COLORS.wizLBlue,
            overflow:"hidden"
          }}>
            <ScrollView
    style={{ flex: 1, width: (width * 0.855), alignContent: 'center'}}
    pagingEnabled={true}
    horizontal={true}
    scrollEventThrottle={16} >
        {(image[0] == nullImage) && (<View style={{
          width: (width*81/100),
          marginLeft:(width*225/10000),
          marginRight:(width*225/10000)
        }}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            resizeMode="contain"
            tintColor={COLORS.white}
            borderRadius={30}
            source={nullImage}/>
        </View>)}
        
        {image.map((img, index) => ((image[0] != nullImage) && (
        <View style={{
          width: (width*81/100),
          marginLeft:(width*225/10000),
          marginRight:(width*225/10000)
        }} key={index}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            resizeMode="contain"
            borderRadius={30}
            source={{ uri: img.uri }}/>
        </View>
        )))}
</ScrollView>
          </View>

          <View style={{ 
        height: 10,
        marginTop: 20,
        width:'100%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1
        }}/>

<TouchableOpacity style={{
  width: 'auto'
}} onPress={create}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                marginBottom: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                shadowColor: COLORS.wizPurp,
                shadowRadius:10,
                flexDirection:'row'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  width:'auto',
                  alignSelf:'center',
                  textAlign:'center',
                  margin:20,
                }}>Create District</Text>
              </View>
            </TouchableOpacity>

        </ScrollView>

      </View>

    </SafeAreaView>
  )
}

export default CreateDistrict;