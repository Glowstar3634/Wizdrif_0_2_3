import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native'
import { RadioButton } from 'react-native-paper';
import React from 'react'
import styles from '../styles/search';
import Post from "./objects/postObj";
import Profile from "./objects/profileObj";

import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

const CardView = ({route}) => {
  const { currentUser, deck, type, label } = route.params;
  const [selectedAnswers, setSelectedAnswers] = React.useState(Array(deck.length).fill(null)); 
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');

  const [scrollViewHeight, setScrollViewHeight] = React.useState(0);

  React.useEffect(() => {
    const screenHeight = height;
    setScrollViewHeight(screenHeight);
  }, []);

  const checkAnswer = (index, card, choice) => {

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
}} onPress={checkAnswer(index, card, selectedAnswers[index])}>
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
          }}>
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