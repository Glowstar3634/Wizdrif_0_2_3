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
import gtags from "./lists/groupTags";

import badWordChecker from "./functions/badWordChecker";
import scanContent from "./functions/scanContent";
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

import Post from "./objects/postObj";
import {Profile} from './objects/profileObj';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set} from 'firebase/database';


const CreateGroup = ({route}) => {
  const { currentUser, district } = route.params;
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

  const [postPrivate, setPostPrivate] = React.useState(false);
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
  var groupJSON = {
    "name": "",
    "description": "",
    "tags": [],
    "owner": "",
    "settings": {
        "private": false,
        "maxMembers": -1,
        "allowedAccounts": [],
        "levelReq": 0,
        "inviteOnly": false
    },
    "members": [],
    "admins": [],
    "groupID": "",
    "district": null
  }


  const toggleSwitch = () => setPostPrivate(previousState => !previousState);
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
      alert('Please enter a name for your group');
      return;
    }
    if (titleInput.length > 75 || titleInput.length < 5) {
      alert('Group name must be between 5-75 characters');
      return;
    }
    if (titleInput.trim() == "The Admins" || titleInput.trim() == "Wizdrif" || titleInput.trim() == "Ghosts of Deletion" || titleInput.trim() == "General Chat") {
      alert('That group name is restricted!');
      return;
  }
    if (!descInput.trim()) {
      alert('Please enter a description for your group');
      return;
    }
    if (descInput.length > 600) {
      alert('Maximum description length of 600 characters');
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
  
    
    console.log('Proceeding...');
    
    if(tags1){
        groupJSON.tags.push(tags1);
    }
    if(tags2 && tags1 != tags2){
        groupJSON.tags.push(tags2);
    }
    console.log('Group Name:', titleInput);
    console.log('Description:', descInput);
    console.log('Private:', postPrivate);
    console.log('Images:', (image[0] != nullImage));
    console.log('Tags:', postTags.length);

    uploadPost();
  
    // confirmPostCreation
  };

  const uploadPost = async () =>{
    let d = new Date();
    let groupID = "group" + d.getTime() + "=" + currentUser.getUsername();
    
    if(district){
      groupJSON.district = district.districtID

      groupJSON.name = titleInput.trim();
    groupJSON.description = descInput.trim();
    groupJSON.owner = district.owner;
    groupJSON.settings.private = true;
    groupJSON.settings.maxMembers = -1;
    groupJSON.settings.allowedAccounts = district.settings.allowedAccounts;
    groupJSON.settings.levelReq = 0;
    groupJSON.settings.inviteOnly = true;
    groupJSON.members = district.members;
    groupJSON.admins = district.admins;
    groupJSON.groupID = groupID;
    }else {
      groupJSON.district = null

      groupJSON.name = titleInput.trim();
    groupJSON.description = descInput.trim();
    groupJSON.owner = currentUser.getUsername();
    groupJSON.settings.private = postPrivate;
    groupJSON.settings.maxMembers = max;
    groupJSON.settings.allowedAccounts = allowedAccounts;
    groupJSON.settings.levelReq = levelReq;
    groupJSON.settings.inviteOnly = invite;
    groupJSON.members = [currentUser.getUsername()];
    groupJSON.admins = [currentUser.getUsername()];
    groupJSON.groupID = groupID;
    }

    const userPostRef = ref(database, 'users/' + currentUser.getUsername()+ "/groups/" + groupID);
    const pubPostRef = ref(database, 'groups/' + groupID);
    set(userPostRef, groupJSON) //Publishing to user post reference
    .then(async() => {
      console.log('Group successfully saved to user reference');
      if(true){ 
        set(pubPostRef, groupJSON) //Publishing to public posts reference
        .then(async() => {
          alert('Group created successfully to Wizdrif server');
          navigation.goBack()
        })
        .catch((error) => {
          console.error('Error making group data public:', error);
        });
      }
    })
    .catch((error) => {
      console.error('Error creating group:', error);
    });
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
        alignItems: 'center',
        width: "100%"
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
        <Text style={styles.sectionHeader}>Create a Group</Text>
        <ScrollView contentContainerStyle={{alignItems: 'center'}} style={{width: "100%"}}>
        
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
          <Text style={styles.fieldDesc}>Group Name</Text>
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
        data={gtags} 
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
        data={gtags} 
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
                }}>Create Group</Text>
              </View>
            </TouchableOpacity>

        </ScrollView>

      </View>

    </SafeAreaView>
  )
}

export default CreateGroup;