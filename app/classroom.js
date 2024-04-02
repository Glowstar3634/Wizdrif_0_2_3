import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

const Classroom = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
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
        <Text style={styles.sectionHeader}>Classroom</Text>
        <Text style={styles.sectionSubHeader}>Learn from material shared by other students</Text>

        <View style={[{
          borderRadius: 20,
          height: 60,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }, styles.sectionShadow]}>
        {/* Content filter control */}
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <Text style={styles.fieldDesc}>Post Filter</Text>
          <View style={styles.field}>
          {/* type dropdown */}
          </View>

          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent:'space-around'
          }}>
            <View style={[styles.safeContain, {flex:1}]}>
              <Text style={styles.fieldDesc}>Subject</Text>
              <View style={[styles.field, {width:'90%'}]}>
              {/* Subject dropdown */}
              </View>
            </View>

            <View style={[styles.safeContain, {flex:1}]}>
              <Text style={styles.fieldDesc}>Topic</Text>
              <View style={[styles.field, {width:'90%'}]}>
              {/* Topic dropdown */}
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
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=> navigation.navigate("postview", {currentUser: currentUser})}>
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

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => navigation.navigate("cardview", {currentUser: currentUser})}>
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
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:-2}]} onPress={()=> navigation.navigate("createpost", {currentUser: currentUser})}>
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