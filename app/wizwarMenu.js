import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

const WizWar = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const [modalVisible, setModalVisible] = React.useState(false);
  const { width, height } = Dimensions.get('window');

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
      }}>
        <ScrollView>
        <Text style={[styles.sectionHeader, {alignSelf: 'center', fontSize: 30}]}>Wiz Wars</Text>
        <Text style={styles.sectionSubHeader}>Talk to other students from your district or around the globe.</Text>

        <View>
        <Text style={[styles.subSectionHeader]}>Inventory</Text>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 250,
          marginTop: 20,
          width: '95%',
          alignSelf:'center',
          flexDirection:'row',
          justifyContent:'space-evenly',
          backgroundColor: COLORS.dark2
        }]}>

        <View style={[{
          borderRadius: 20,
          height: "80%",
          marginTop: 20,
          marginBottom: 20,
          width: '45%',
          alignSelf:'center',
          flexDirection:'column',
          justifyContent:'center',
          overflow:'hidden'
        }]}>
        <TouchableOpacity style={[{
          flex:6,
          width: '100%',
          alignSelf:'center',
          flexDirection:'column',
          justifyContent:'center',
        }]} onPress={() => navigation.navigate('orbs', {currentUser:currentUser})}>
        <Image
            style={{  width: '700%', height: '700%',flex:6, alignSelf:"center"}}
            source={require('../constants/images/Orbs/Wizdrif-Special-Orb.png')}
        />
        <Text style={[styles.subSectionHeader, {fontSize: 18, flex:1, marginStart:0, alignSelf:'center'}]}>Orbs</Text>
        </TouchableOpacity>
        </View>

        <View style={[{
          borderRadius: 20,
          height: "80%",
          marginTop: 20,
          marginBottom: 20,
          width: '45%',
          alignSelf:'center',
          flexDirection:'column',
          justifyContent:'center',
          overflow:'hidden'
        }]}>
        <TouchableOpacity style={[{
          borderRadius: 20,
          height: "100%",
          marginTop: 20,
          marginBottom: 20,
          width: '100%',
          alignSelf:'center',
          flexDirection:'column',
          backgroundColor: COLORS.dark2
        }]}>
        <Image
            style={{  width: '275%', height: '275%',flex:6, alignSelf:"center"}}
            source={require('../constants/images/Icons/My Relics.png')}
        />
        <Text style={[styles.subSectionHeader, {fontSize: 18, flex:1, marginStart:0, alignSelf:'center'}]}>Relics</Text>
        </TouchableOpacity>
        </View>

        </View>
        </View>

        <View>
        <Text style={[styles.subSectionHeader]}>Battles</Text>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 250,
          marginTop: 20,
          width: '95%',
          alignSelf:'center',
          flexDirection:'row',
          justifyContent:'space-evenly',
          backgroundColor: COLORS.dark2
        }]}>
        <View style={[{
          borderRadius: 20,
          height: "80%",
          marginTop: 20,
          marginBottom: 20,
          width: '45%',
          alignSelf:'center',
          flexDirection:'column',
          justifyContent:'center',
          overflow:'hidden'
        }]}>
        <TouchableOpacity style={[{
          borderRadius: 20,
          height: "100%",
          marginTop: 20,
          marginBottom: 20,
          width: '100%',
          alignSelf:'center',
          flexDirection:'column',
          backgroundColor: COLORS.dark2
        }]} onPress={()=> navigation.navigate("duelprep", {currentUser: currentUser, opponent: null, rankLock: false})}>
        <Image
            style={{  width: '230%', height: '230%',flex:6, alignSelf:"center"}}
            source={require('../constants/images/Icons/Quick-Duels.png')}
        />
        <Text style={[styles.subSectionHeader, {fontSize: 18, flex:1, marginStart:0, alignSelf:'center'}]}>Quick Duel</Text>
        </TouchableOpacity>
        </View>
        
        <View style={[{
          borderRadius: 20,
          height: "80%",
          marginTop: 20,
          marginBottom: 20,
          width: '45%',
          alignSelf:'center',
          flexDirection:'column',
          justifyContent:'center',
          overflow:'hidden'
        }]}>
        <TouchableOpacity style={[{
          borderRadius: 20,
          height: "100%",
          marginTop: 20,
          marginBottom: 20,
          width: '100%',
          alignSelf:'center',
          flexDirection:'column',
          backgroundColor: COLORS.dark2
        }]}>
        <Image
            style={{  width: '200%', height: '200%',flex:6, alignSelf:"center"}}
            source={require('../constants/images/Icons/Competition.png')}
        />
        <Text style={[styles.subSectionHeader, {fontSize: 18, flex:1, marginStart:0, alignSelf:'center'}]}>Tournament</Text>
        </TouchableOpacity>
        </View>
        
        </View>
        </View>
        </ScrollView>

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

export default WizWar;