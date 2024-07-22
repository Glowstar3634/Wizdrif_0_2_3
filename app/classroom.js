import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import * as Progress from 'react-native-progress';
import { SelectList, MultipleSelectList  } from 'react-native-dropdown-select-list';
import { COLORS } from '../constants';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get} from 'firebase/database';

import UserHeader from "./components/userHeader";

import Post from "./objects/postObj";
import Card from "./objects/cardObj";
import Profile from "./objects/profileObj";
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
import topicsAll from "./lists/topicsAll";
import tags from "./lists/tags";

const Classroom = ({route}) => {
  const { currentUser } = route.params;

  const allPostTypes = [...postTypes];
  allPostTypes.unshift("Any");
  const allSubjects = [...subjects];
  allSubjects.unshift("All Subjects");

  const [modalVisible, setModalVisible] = React.useState(false);
  const [topicData, setTopicData] = React.useState(noTopics);
  const [postType, setPostType] = React.useState("Any");
  const [postViewLabel, setpostViewLabel] = React.useState("");
  const [subject, setSubject] = React.useState("All Subjects");
  const [topic, setTopic] = React.useState("General - All Subjects");
  const navigation = useNavigation();
  const [menu, setMenu] = React.useState([]);
  const [shortenedMenu, setShortenedMenu] = React.useState([]);
  const [deck, setDeck] = React.useState([]);
  const [shortenedDeck, setShortenedDeck] = React.useState([]);
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');

  const viewPostsIn = () => {
    if (postType == "Any" && subject == "All Subjects"){
      navigation.navigate("postview", {currentUser: currentUser, menu: shortenedMenu, type: "All", label: "All Subjects"});
    }
    else {
      navigation.navigate("postview", {currentUser: currentUser, menu: shortenedMenu, type: postType, label: topic});
    }
  }

  const viewCardsIn = () => {
    if (postType == "Any" && subject == "All Subjects"){
      navigation.navigate("cardview", {currentUser: currentUser, deck: shortenedDeck, type: "All", label: "All Subjects"});
    }
    else {
      navigation.navigate("cardview", {currentUser: currentUser, deck: shortenedDeck, type: postType, label: topic});
    }
  }

  const shuffleArray = array => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  React.useEffect(() => {
    loadSelection();
  }, [postType, subject, topic]);

  const loadSelection = async() => {
    try {
      const postsRef = ref(database, 'posts');
      const snapshot = await get(postsRef);
      if (snapshot.exists()) {
        const postsData = snapshot.val();
        const postsArray = await Promise.all(Object.keys(postsData).map(async key => {
          const post = postsData[key];
          const postObj = new Post(
            post.poster,
            post.subjectText,
            post.description,
            post.title,
            post.postType,
            post.topic
          );
          postObj.setPostID(post.postID)
          postObj.setTags(post.tags)
          const currentTags = postObj.getTags() || [];
          postObj.setTags([...currentTags, post.subjectText]);
          postObj.setTags([...currentTags, post.topic]);
          postObj.setTags([...currentTags, post.postType]);

          const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => {
          const user = usersData[key];
          const userObj = new Profile(
            user.username,
            user.firstName,
            user.lastName,
            user.password,
            user.email,
            user.age,
            user.grade
          );
          userObj.setDistrict(user.district);
          userObj.setLevel(user.level);
          return userObj;
        });

        const ghostUser = new Profile(
          "Deleted User",
          "N",
          "A",
          "ghost123",
          "iamdeleted@gmail.com",
          1000000,
          12
        );

        ghostUser.setDistrict("Ghosts of Deletion");
        ghostUser.setLevel(-3634);

        const foundUser = usersArray.find(x => x.getUsername() === post.poster);
        if (foundUser) {
          postObj.setPoster(foundUser);
        } else{
          postObj.setPoster(ghostUser);
        }
      }
  
          postObj.setImages([])
          postObj.setPics(post.pics)
          for (let i = 0; i < postObj.getPics(); i++){
            const ref = firebase.storage().ref('images/posts/' + postObj.getPostID()).child('pic' + (i+1));
            postObj.addImages(await ref.getDownloadURL()
              .then((url) => {
                return url;
              })
              .catch((e) => console.log('getting downloadURL of image error => ', e)));
          }
          
          postObj.setPrivate(post.private)
          postObj.setPics(post.pics)
          postObj.setLikes(post.likes)
          return postObj;
        }));
        
        const filteredPosts = postsArray.filter(post => {
          const postTypeMatch = postType === 'Any' || post.getPostType() === postType;
          const subjectMatch = subject === 'All Subjects' || post.getSubjectText() === subject;
          const topicMatch = topic.includes('General -') || subject === 'All Subjects' || post.getTopic() === topic;
          return postTypeMatch && subjectMatch && topicMatch;
        });
        
        const menuItems = filteredPosts.slice(0, 50); // Limit to 50 items for performance
        setMenu(menuItems);
  
        const shuffledMenu = shuffleArray(menuItems.filter((item) => currentUser.username !== item.getPoster())).concat(shuffleArray(menuItems.filter(item => currentUser.username === item.getPoster())));
        setShortenedMenu(shuffledMenu);
        console.log(('Success loading posts: ' + shuffledMenu.length + ' posts loaded'));
      }
    } catch (error) {
      console.log('Error loading posts:', error);
    }

    try {
      const cardsRef = ref(database, 'cards');
      const snapshot = await get(cardsRef);
      if (snapshot.exists()) {
        const cardsData = snapshot.val();
        const cardsArray = await Promise.all(Object.keys(cardsData).map(async key => {
          const card = cardsData[key];
          const cardObj = new Card(
            card.cardID,
            card.poster,
            card.subject,
            card.topic,
            card.title,
            card.answer1,
            card.answer2,
            card.answer3,
            card.answer4,
            card.correct,
            card.hasPic,
            card.views
          );
          if(card.hasPic == null){
            cardObj.setHasPic(card.hasPicture);
          }
          if(card.title == null){
            cardObj.setTitle(card.question);
          }
          cardObj.setPrivate(card.private)
          cardObj.setTags(card.tags)
          const currentTags = cardObj.getTags() || [];
          cardObj.setTags([...currentTags, card.subject]);
          cardObj.setTags([...currentTags, card.topic]);

          const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => {
          const user = usersData[key];
          const userObj = new Profile(
            user.username,
            user.firstName,
            user.lastName,
            user.password,
            user.email,
            user.age,
            user.grade
          );
          userObj.setDistrict(user.district);
          userObj.setLevel(user.level);
          return userObj;
        });

        const ghostUser = new Profile(
          "Deleted User",
          "N",
          "A",
          "ghost123",
          "iamdeleted@gmail.com",
          1000000,
          12
        );

        ghostUser.setDistrict("Ghosts of Deletion");
        ghostUser.setLevel(-3634);

        const foundUser = usersArray.find(x => x.getUsername() === card.poster);
        if (foundUser) {
          cardObj.setPoster(foundUser);
        } else{
          cardObj.setPoster(ghostUser);
        }
      }
  
      cardObj.setImage([])
          if (cardObj.getHasPic()){
            const ref = firebase.storage().ref('images/cards/' + cardObj.getCardID()).child('pic');
            cardObj.setImage([await ref.getDownloadURL()
              .then((url) => {
                return url;
              })
              .catch((e) => console.log('getting downloadURL of image error => ', e))]);
          }
        
          return cardObj;
        }));
        
        const filteredCards = cardsArray.filter(card => {
          const postTypeMatch = true;
          const subjectMatch = subject === 'All Subjects' || card.getSubject() === subject;
          const topicMatch = topic.includes('General -') || subject === 'All Subjects' || card.getTopic() === topic;
          return postTypeMatch && subjectMatch && topicMatch;
        });
        
        const deckItems = filteredCards.slice(0, 50); // Limit to 50 items for performance
        setDeck(deckItems);
  
        const shuffledDeck = shuffleArray(deckItems.filter((item) => currentUser.username !== item.getPoster())).concat(shuffleArray(deckItems.filter(item => currentUser.username === item.getPoster())));
        setShortenedDeck(shuffledDeck);
        console.log(('Success loading cards: ' + shuffledDeck.length + ' cards loaded'));
      }
    } catch (error) {
      console.log('Error loading cards:', error);
    }
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
    } else if (subject == 'All Subjects'){
      setTopicData(topicsAll);
    } else {
      setTopicData(noTopics);
    }
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
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
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModalVisible(!modalVisible);
              navigation.navigate("createpost", {currentUser: currentUser})}}>
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
                }}>Post</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModalVisible(!modalVisible);
              navigation.navigate("createcard", {currentUser: currentUser})}}>
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
                }}>Flashcard</Text>

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
      <UserHeader currentUser={currentUser} />

      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
        <Text style={styles.sectionHeader}>Classroom</Text>
        <Text style={styles.sectionSubHeader}>Learn from material shared by other students</Text>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <Text style={styles.fieldDesc}>What kind of posts do you want to see?</Text>
          <View style={[styles.field]}>
          <SelectList 
        setSelected={(postType) => setPostType(postType)} 
        data={allPostTypes} 
        save="value"
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:5
        }}
    />
          </View>

          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent:'space-around', zIndex:-5
          }}>
            <View style={[styles.safeContain, {flex:1, zIndex:-5}]}>
              <Text style={styles.fieldDesc}>Subject</Text>
              <View style={[styles.field, {width:'90%'}]}>
              <SelectList 
        setSelected={(subject) => topicSelector(subject)} 
        data={allSubjects} 
        save="value"
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:5
        }}
    />
              </View>
            </View>

            <View style={[styles.safeContain, {flex:1, zIndex:-5}]}>
              <Text style={styles.fieldDesc}>Topic</Text>
              <View style={[styles.field, {width:'90%'}]}>
              <SelectList 
        setSelected={(topic) => setTopic(topic)} 
        data={topicData}
        save="value"
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:5
        }}
    />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.subSectionHeader}>Results</Text>
        <View style={{
            width: '95%',
            alignSelf:'center',
            flexDirection: 'row',
            alignContent:'center',
            justifyContent:'flex-end'
          }}>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={viewPostsIn}>
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
                alignContent:'center',
                justifyContent:'space-evenly'
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
                }}>Posts</Text>
                <View style={{  width: 90, height: '100%', alignSelf:"flex-start", overflow:'hidden', justifyContent:'center'}}>
        <Image
            style={{  width: '50%', height: '100%', alignSelf:"center"}}
            tintColor={COLORS.white}
            resizeMode="contain"
            source={require('../constants/images/UIcons/post-it-black-notes-22348.png')}
        />
        </View>

              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={viewCardsIn}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                shadowColor: COLORS.wizPurp,
                shadowRadius:10,
                flexDirection:'row',
                justifyContent:'space-evenly'
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
                }}>Cards</Text>
        <View style={{  width: 70, height: '100%', alignSelf:"flex-start", overflow:'hidden'}}>
        <Image
            style={{  width: '500%', height: '100%', alignSelf:"flex-start", marginLeft: -130}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/Cards.png')}
        />
        </View>
          
              </View>
            </TouchableOpacity>
        </View>

        <View style={{ 
        height: 10,
        marginTop: 20,
        width:'100%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1
        }}/>

        <View style={{
            width: '95%',
            alignSelf:'center',
            flexDirection: 'row',
            alignContent:'center',
            justifyContent:'flex-end'
          }}>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => navigation.navigate("notebook", {currentUser: currentUser})}>
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
                }}>Notebook</Text>

              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => navigation.navigate("homework", {currentUser: currentUser})}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.gray2,
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
                }}>Homework</Text>
              </View>
            </TouchableOpacity>
        </View>



      </View>

      <View style={[{
          height:60,
          alignSelf: 'center',
          borderRadius: 30,
          margin: 10,
          width: '98%',
          flexDirection:'row',
          justifyContent: 'space-between',
          backgroundColor: COLORS.dark2
        }, styles.sectionShadow]}>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("classroom", {currentUser: currentUser})}>
        <Image
            style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/home-6133.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("studyhall", {currentUser: currentUser})}>
        <Image
            style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:-2}]} onPress={() => setModalVisible(true)}>
        <Image
            style={{  width: '100%', height: '100%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-plus-60.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("wizwar", {currentUser: currentUser})}>
        <Image
            style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/lightning-bolt-4124.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("notebook", {currentUser: currentUser})}>
        <Image
            style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/book-13427.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

export default Classroom;