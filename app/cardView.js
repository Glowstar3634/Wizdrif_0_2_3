import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal, Switch } from 'react-native'
import { RadioButton } from 'react-native-paper';
import React, { useReducer } from 'react'
import styles from '../styles/search';
import Post from "./objects/postObj";
import Profile from "./objects/profileObj";

import Reward from "./components/reward";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { SelectList } from "react-native-dropdown-select-list";
import { COLORS } from '../constants';

import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get, remove, onChildChanged, onChildAdded, off} from 'firebase/database';
import Relic from "./objects/relicObj";
import { getRedirectResult } from "@firebase/auth";

const CardView = ({route}) => {
  const { currentUser, deck, type, label } = route.params;
  const [selectedAnswers, setSelectedAnswers] = React.useState(Array(deck.length).fill(null)); 
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let levelUpReq = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/levelUpReq;
  const { width, height } = Dimensions.get('window');
  const [rewards, setRewards] = React.useState([]);
  const [streak, setStreak] = React.useState(0)

  const [modal2Visible, setModal2Visible] = React.useState(null);
  const [modal3Visible, setModal3Visible] = React.useState(false);
  const [newNotebook, setNewNotebook] = React.useState(("Notebook " + Date.now()));
  const [postsF, setPostsF] = React.useState(true);
  const toggleSwitch1 = () => setPostsF(previousState => !previousState);
  const [postPrivate, setPostPrivate] = React.useState(false);
  const toggleSwitch = () => setPostPrivate(previousState => !previousState);
  
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0);

  
  const [myNotebooks, setMyNotebooks] = React.useState([])
  const [selectedNb, setSelectedNb] = React.useState()

  React.useEffect(()=>{
    loadNotebooks()
  }, [])

  const loadNotebooks = async() => {
    const userBooks = await get(ref(database, "users/" + currentUser.getUsername() + "/notebooks"));
    if(userBooks.exists()){
      let books = Object.entries(userBooks.val() || {});
      books = books.filter(([id, nb]) => nb.type === "cards");
      let ids = books.map(([id, nb]) => id);
      let booknames = books.map(([id, nb]) => nb.name);
      let keyValuePairs = ids.map((id, index) => ({ key: id, value: booknames[index] }));
      
      setMyNotebooks(keyValuePairs);
    }
  }
  

  const createPress = () => {
    setModal2Visible(null);
    setModal3Visible(true);
  }

  const createNewNotebook = async() => {
    if(newNotebook.length > 45){
      alert("Notebook Name is too long! 45 characters max.")
      return null
    }
    const booksRef = await get(ref(database, "users/" + currentUser.getUsername()));
    const notebookID = "notebook" + Date.now() + "=" + currentUser.getUsername()
    if(booksRef.exists()){
      let books = Object.values(booksRef.val().notebooks || {})
      if(books.filter((n) =>{n.name == newNotebook}).length == 0){ //Notebook name is original
        let nbObj = {
          "name": newNotebook,
          "type": (postsF ? "cards" : "posts"),
          "private": postPrivate
        }
        set(ref(database, "users/" + currentUser.getUsername() + "/notebooks/" + notebookID), nbObj)
        .then(()=>{
          setMyNotebooks([...myNotebooks, {key: notebookID, value: newNotebook}])
          loadNotebooks()
          alert(`New Notebook \"${newNotebook}\" Created!`)
          setModal2Visible(false)
        })
      }else{
        alert("You have a notebook with this name already.")
        setModal2Visible(false)
      }
    }
  }

  const savePost = (post, notebook) =>{
    set(ref(database, "users/" + currentUser.getUsername() + "/notebooks/" + notebook + "/entries/" + post), post)
    .then(async ()=>{
      const userBooks = await get(ref(database, "users/" + currentUser.getUsername() + "/notebooks/" + notebook))
      if(userBooks.exists()){
        alert(`Card saved to ${userBooks.val().name}`)
      }
    })
  }

  React.useEffect(() => {
    const screenHeight = height;
    setScrollViewHeight(screenHeight);
  }, []);

  const checkAnswer = async (index, card, choice) => {
    let isRight = (card.getCorrect() == choice ? true : false)
    console.log("Correct: " ,isRight)

    const cardAnswer = {
      cardID: card.getCardID(),
      timestamp: Date.now(),
      choice: choice,
      wasCorrect: isRight
    }
    const ansRef = await get(ref(database, "users/" + currentUser.getUsername() + "/answeredCards"))
    if (ansRef.exists()){
      let keys = Object.keys(ansRef.val() || {})
      if(!keys.includes(card.getCardID())){
        set(ref(database, "users/" + currentUser.getUsername() + "/answeredCards/" + card.getCardID()), cardAnswer)
        .then(()=>{
          if(isRight){
            reward(card.getSubject())
            setStreak(streak+1)
            console.log("Correct!")
          }else{
            setStreak(0)
            console.log("Incorrect.")
          }
        })
      }else{
        if(isRight){
          console.log("Correct, but you already solved this card")
        }else{
          console.log("Incorrect.")
        }
      }
    }else{
      set(ref(database, "users/" + currentUser.getUsername() + "/answeredCards/" + card.getCardID()), cardAnswer)
        .then(()=>{
          if(isRight){
            reward(card.getSubject())
            setStreak(streak+1)
            console.log("Correct!")
          }else{
            setStreak(0)
            console.log("Incorrect.")
          }
        })
    }
    
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const reward = async (subject) => {
    let rewardNum = getRandomInt(1,100);
    let t = getRandomInt(0, 4)
    let enc = ["Nice Job! \u{1F601}", "Correct \u{1F44D}", "\u{1F525} You're on fire! \u{1F525}", "Perfection. \u{1F44C}", "Brilliant!"]
    if (rewardNum < 81){ //XP reward
      console.log("XP reward")
      let sm = (streak > 5 ? 5 : streak)
      const gainedXP = 35 + 7*sm
      const newReward = {
        title: enc[t],
        xp: true,
        quantity: gainedXP
      };
      addXP(gainedXP)
      setRewards([...rewards, newReward]);
    } else if (rewardNum < 100){ //Orb reward
      console.log("Orb reward")
      let orbType = getRandomInt(1,7)
      let sameSub = getRandomInt(0,2)
      if(sameSub != 1){
        if(subject == "Math"){
          orbType = 1
        }
        else if(subject == "Science"){
          orbType = 2
        }
        else if(subject == "English"){
          orbType = 3
        }
        else if(subject == "Social Studies"){
          orbType = 4
        }
        else if(subject == "Business and Economics"){
          orbType = 5
        }
        else if(subject == "Engineering"){
          orbType = 6
        }
        else if(subject == "Programming"){
          orbType = 7
        }
      }
      let orbNum = getRandomInt(1,3)
      const newReward = {
        title: enc[t],
        orb: orbType,
        quantity: orbNum
      };
      setRewards([...rewards, newReward]);
      let userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/math");
        if(orbType == 1){
          userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/math")
        } else if(orbType == 2){
          userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/scie")
        } else if(orbType == 3){
          userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/ensh")
        } else if(orbType == 4){
          userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/sost")
        } else if(orbType == 5){
          userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/buec")
        } else if(orbType == 6){
          userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/engi")
        } else if(orbType == 7){
          userRef = ref(database, "users/" + currentUser.getUsername() + "/orbs/prog")
        }
      const snap = await get(userRef)
      if(snap.exists()){
        let myorbs = snap.val()
        set(userRef, myorbs+orbNum)
      }else{
        set(userRef, orbNum)
      }
    } else{ //Relic reward
      console.log("Relic reward")
      const relicsRef = await get(ref(database, "users/" + currentUser.getUsername() + "/relics"))
      if(relicsRef.exists()){
        let myrelics = Object.keys(relicsRef.val() || {})
        let subRelics = Relic.all()
        if(subject == "Math"){
          subRelics = Relic.all()[0]
        }
        else if(subject == "Science"){
          subRelics = Relic.all()[1]
        }
        else if(subject == "English"){
          subRelics = Relic.all()[2]
        }
        else if(subject == "Social Studies"){
          subRelics = Relic.all()[3]
        }
        else if(subject == "Business and Economics"){
          subRelics = Relic.all()[4]
        }
        else if(subject == "Engineering"){
          subRelics = Relic.all()[5]
        }
        else if(subject == "Programming"){
          subRelics = Relic.all()[6]
        }
        subRelics = subRelics.filter((relic) => {!myrelics.includes(relic)})
        if(subRelics.length() != 0){ //Random (subject) relic that they dont have
          let randomRelic = getRandomInt(0, subRelics.length()-1)
          set(ref(database, "users/" + currentUser.getUsername() + "/relics/" + subRelics[randomRelic]),"")
          .then(()=>{
            const newReward = {
              title: `New Relic! \u{1F929}`,
              relic: subRelics[randomRelic],
              quantity: 1
            };
            setRewards([...rewards, newReward]);
          })
        }
      }
    }
  }
  
  const addXP = (xp) => {
    let newlevelUpReq = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
    currentUser.setXp(currentUser.getXp() + xp)
    while(currentUser.getXp() > newlevelUpReq){
      currentUser.setXp(currentUser.getXp() - newlevelUpReq)
      currentUser.levelUp()
      newlevelUpReq = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
    }
    set(ref(database, "users/" + currentUser.getUsername() + "/xp"), currentUser.getXp())
    .then(()=>{
      set(ref(database, "users/" + currentUser.getUsername() + "/level"), currentUser.getLevel())
    })
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
      {rewards.map((reward, index) => (
          <Reward key={index} num={index} reward={reward} onFade={()=>{}}/>
      ))}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modal2Visible != null}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModal2Visible(null);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
            <Text style={[styles.sectionHeader, {alignSelf: 'center', marginStart: 0, marginBottom: 0}]}>Save Card</Text>
            <Text style={[styles.sectionHeader, {alignSelf: 'center', marginStart: 0, marginBottom: 20, fontSize: 16, fontWeight: 300}]}>{modal2Visible ? modal2Visible.getTitle() : null}</Text>
            <Text style={styles.fieldDesc}>Notebook</Text>
          <View style={[styles.field, {marginBottom: 10}]}>
          <SelectList
        setSelected={(tag) => setSelectedNb(tag)} 
        data={myNotebooks}
        save="key"
        notFoundText="You don't have any notebooks for cards!"
        labelStyles={{
          color:COLORS.white
        }}
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:25,
        }}
    />
          </View>
          
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%', zIndex: -20
            }} onPress={()=> {
              savePost(modal2Visible.getCardID(), selectedNb)
              setModal2Visible(null);
              }}>
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
                }}>Save</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%', zIndex: -20
            }} onPress={()=> {createPress()}}>
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
                  fontSize: 16,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:'auto',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Create New Notebook</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModal2Visible(null)}>
              
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
        visible={modal3Visible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModal3Visible(!modal3Visible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
            <Text style={[styles.sectionHeader, {alignSelf: 'center', marginStart: 0, marginBottom: 20}]}>New Notebook</Text>
            <Text style={styles.fieldDesc}>Name</Text>
          <View style={[styles.field, {marginBottom: 10}]}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={inp => setNewNotebook(inp)}
            defaultValue= {newNotebook}
          />
          </View>
          <View style={[{
          borderRadius: 20,
          height: 60,
          marginBottom: 20,
          width: '100%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          alignItems:'center',
          justifyContent:'center'
        }, styles.sectionShadow]}>
          <Text style={[styles.fieldDesc,{fontSize:14,fontWeight:'600', alignSelf:'center'}]}>For Cards</Text>
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
        thumbColor={COLORS.white}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch}
        value={postPrivate}
      />
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Private</Text>
        </View>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModal3Visible(!modal3Visible);
              createNewNotebook()}}>
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
                }}>Create</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModal3Visible(false)}>
              
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

      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
      
        <TouchableOpacity
          style={{alignSelf:'left'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        <Text style={[styles.sectionHeader, {height: 30}]}>Viewing Cards In: {label}</Text>
        <Text style={[styles.sectionSubHeader, {height: 15}]}>Bookmark or Public Filter</Text>

        <View style={{
          flex:1,
          borderRadius: 10
        }}>
        <ScrollView
        style={{flex:1}}
        pagingEnabled={true}
        scrollEventThrottle={16}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setScrollViewHeight(height); // Update the height of the ScrollView
        }}>
          
        {deck.map((card, index) => ((
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: (scrollViewHeight-30),
          alignSelf:'center',
          marginBottom: 15,
          marginTop: 15,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]} key={index}>
          
          <View style={{
            width:'100%',
            height:60,
            backgroundColor: COLORS.gray2,
            borderRadius: 15,
            flexDirection:'row'
          }}>{/* Post Header */}
          <View style={{
            flex: 1,
            height: "100%",
            justifyContent:'space-evenly'
          }}>
          <Text style={styles.postHeader}>{card.getPoster().getUsername()}</Text>
          <Text style={styles.postHeader}>Level: {card.getPoster().getLevel()}</Text>
          </View>
          <View style={{
            width: 60,
            height: "100%",
            borderRadius:30,
            borderWidth:2,
            justifyContent:'space-around'
          }}>
          <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            borderRadius={30}
            source={require('../constants/images/UIcons/icons8-person-64.png')}/>
          </View>

          <View style={{
            flex: 1,
            height: "100%",
            justifyContent:'space-evenly'
          }}>
          <Text style={styles.postHeaderRight}>District</Text>
          <Text style={styles.postHeaderRight}>{card.getPoster().getDistrict().name}</Text>
          </View>
          </View>{/* Post Header */}
          
          <ScrollView style={{
            width: '100%',
            flexDirection:'row',
            margin:5
          }} horizontal={true}>{/* Post Tags */}
            {card.getTags().map((tag, index2) => ((
            <View style={{
              width:'auto',
              height: 30,
              backgroundColor: COLORS.wizBlue,
              borderRadius:15,
              alignItems:'center',
              marginRight: 10,
              padding:5,
            }} key={index2}>
              <Text style={{
                textAlign: 'center',
                fontWeight: 'bold',
                alignContent:'center', 
                margin:0,
                color:COLORS.white
              }}>{tag}</Text>
            </View>
            )))}
          </ScrollView>{/* Post Tags */}
          <View style={{
            width: '100%',
            flex:5,
            marginTop:10,
            marginBottom:10,
          }}>
            {((card.getHasPic()) && (<ScrollView
    style={{ flex: 1, width:'100%', alignContent: 'center'}}
    pagingEnabled={true}
    horizontal={true}
    scrollEventThrottle={16}>
        {card.getImage().map((image, index2) => ((
        <View style={{
          width: (width* 0.95* 0.9),
          marginLeft:(width*0.025* 0.9),
          marginRight:(width*0.025* 0.9),
        }} key={index2}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            borderRadius={30}
            source={{ uri: image }}/>
        </View>
    )))}
</ScrollView>))}
          </View>

          <View style={{
            width: '100%',
            height:'auto',
            justifyContent:'flex-start'
          }}>
          {card.getTitle().split('\\n').map((line,index) => (
            <Text key={index} style={[styles.postTitle]}>{line}</Text>
          ))}
            <ScrollView style={{height:'auto'}}>
            <View style={styles.radioButton}> 
                    <RadioButton.Android 
                        value="option1"
                        status={selectedAnswers[index] === 1 ?  
                                'checked' : 'unchecked'} 
                        onPress={() => {
                          const newAnswers = [...selectedAnswers];
                          newAnswers[index] = 1;
                          setSelectedAnswers(newAnswers);
                        }} 
                        color= {COLORS.wizBlue}
                    /> 
                    <Text style={styles.fieldDesc}> 
                    {card.getAnswer1()}
                    </Text> 
                </View> 
  
                <View style={styles.radioButton}> 
                    <RadioButton.Android 
                        value="option2"
                        status={selectedAnswers[index] === 2 ?  
                                 'checked' : 'unchecked'} 
                        onPress={() => {
                          const newAnswers = [...selectedAnswers];
                          newAnswers[index] = 2;
                          setSelectedAnswers(newAnswers);
                        }} 
                        color={COLORS.wizBlue}
                    /> 
                    <Text style={styles.fieldDesc}> 
                    {card.getAnswer2()}
                    </Text> 
                </View>
                <View style={styles.radioButton}> 
                    <RadioButton.Android 
                        value="option3"
                        status={selectedAnswers[index] === 3 ?  
                                 'checked' : 'unchecked'} 
                        onPress={() => {
                          const newAnswers = [...selectedAnswers];
                          newAnswers[index] = 3;
                          setSelectedAnswers(newAnswers);
                        }} 
                        color={COLORS.wizBlue}
                    /> 
                    <Text style={styles.fieldDesc}> 
                    {card.getAnswer3()}
                    </Text> 
                </View>
                <View style={styles.radioButton}> 
                    <RadioButton.Android 
                        value="option4"
                        status={selectedAnswers[index] === 4 ?  
                                 'checked' : 'unchecked'} 
                        onPress={() => {
                          const newAnswers = [...selectedAnswers];
                          newAnswers[index] = 4;
                          setSelectedAnswers(newAnswers);
                        }} 
                        color={COLORS.wizBlue}
                    /> 
                    <Text style={styles.fieldDesc}> 
                    {card.getAnswer4()}
                    </Text> 
                </View>
            </ScrollView>
          </View>
          <TouchableOpacity style={{
  width: 'auto'
}} onPress={()=>{checkAnswer(index, card, selectedAnswers[index])}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 0,
                marginBottom: 20,
                width: 'auto',
                alignSelf: 'center',
                justifyContent:'center',
                backgroundColor: COLORS.wizLBlue,
                shadowColor: COLORS.wizLBlue,
                shadowRadius:10,
                flexDirection:'row'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 18,
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:'auto',
                  width:90,
                  alignSelf:'center',
                  textAlign:'center',
                  margin:15
                }}>Check</Text>
              </View>
            </TouchableOpacity>
          <View style={{
            width: '100%',
            flex:2,
            flexDirection:'row',
            justifyContent:'flex-end',
          }}>
            <TouchableOpacity style={{
            width: 60,
            margin:5
          }}>
            <Image
            style={{ width: 60, height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-notlike-96.png')}/>
            </TouchableOpacity>
            <TouchableOpacity style={{
            width: 60,
            margin:5
          }} onPress={() =>{setModal2Visible(card)}}>
            <Image
            style={{ width: 60, height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-bookmark-96.png')}/>
            </TouchableOpacity>
          </View>
        </View>
        )))}
        </ScrollView>
        </View>

      </View>

    </SafeAreaView>
  )
}

export default CardView;