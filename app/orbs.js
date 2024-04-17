import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

const Orbs = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const [modalVisible, setModalVisible] = React.useState(false);
  const { width, height } = Dimensions.get('window');

  const [orbType, setOrbType] = React.useState(0);
  const [orbPic, setOrbPic] = React.useState('../constants/images/Orbs/Wizdrif-Mystery-Orb.png');
  const [orbCount, setOrbCount] = React.useState(0);
  const [orbName, setOrbName] = React.useState("Select an Orb");

  React.useEffect(() => {
    orbOptions();
  }, [orbType]);

  const orbOptions = (orb) => {
    if(orb != orbType && orb != null && orb != 0){
      setOrbType(orb);
      if (orb == 1){
        setOrbPic('../constants/images/Orbs/Wizdrif-Math-Orb.png');
        setOrbName();
      } else if (orb == 2){
        setOrbPic('../constants/images/Orbs/Wizdrif-Science-Orb.png');
        setOrbName();
      } else if (orb == 3){
        setOrbPic('../constants/images/Orbs/Wizdrif-English-Orb.png');
        setOrbName();
      } else if (orb == 4){
        setOrbPic('../constants/images/Orbs/Wizdrif-Social-Studies-Orb.png');
        setOrbName();
      } else if (orb == 5){
        setOrbPic('../constants/images/Orbs/Wizdrif-BE-Orb.png');
        setOrbName();
      } else if (orb == 6){
        setOrbPic('../constants/images/Orbs/Wizdrif-Engineering-Orb.png');
        setOrbName();
      } else if (orb == 7){
        setOrbPic('../constants/images/Orbs/Wizdrif-Programming-Orb.png');
        setOrbName();
      } else if (orb == 8){
        setOrbPic('../constants/images/Orbs/Wizdrif-Special-Orb.png');
        setOrbName();
      }
    } else {
        setOrbPic('../constants/images/Orbs/Wizdrif-Mystery-Orb.png');
        setOrbName("Select an Orb");
        setOrbCount('');
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
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:35}]}>Orbs</Text>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: (width*0.95),
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center'
        }]}>
          <View style={{
            width: "100%",
            height: (width*0.95),
            alignItems:'center',
            justifyContent:'center'
          }}>
          <TouchableOpacity style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center'
          }}>
            <View style={{
            width:80,
            height:80,
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '45deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Math-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute',transform: [{rotate: '-45deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Math-Orb.png')}
        />
            </View>
            
          </TouchableOpacity>
          <View style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            marginTop:((width*0.2*0.1980)-40)
          }}>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginRight:((width*0.6*0.4113)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '-96.43deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Science-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '96.43deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Science-Orb.png')}
        />
            </TouchableOpacity>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginLeft:((width*0.6*0.4113)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '96.43deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/English-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '-96.43deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-English-Orb.png')}
        />

            </TouchableOpacity>
            
          </View>
          <View style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            marginTop:((width*0.3*0.4450)-40)
          }}>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginRight:((width*0.6*0.5129)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '-147.86deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Social-Studies-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '147.86deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Social-Studies-Orb.png')}
        />

            </TouchableOpacity>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginLeft:((width*0.6*0.5129)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '147.86deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Programming-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '-147.86deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Programming-Orb.png')}
        />

            </TouchableOpacity>
          </View>
          <View style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            marginTop:((width*0.3*0.3569)-40)
          }}>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginRight:((width*0.6*0.2282)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '-199.29deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Engineering-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '199.29deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Engineering-Orb.png')}
        />

            </TouchableOpacity>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginLeft:((width*0.6*0.2282)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '199.29deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/BE-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '-199.29deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-BE-Orb.png')}
        />

            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{
            width:120,
            height:120,
            position:'absolute',
            justifyContent:'center',
            overflow:'hidden'
          }}>
          <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2, position:'absolute'}}
            source={require('../constants/images/Orbs/Special-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={require('../constants/images/Orbs/Wizdrif-Special-Orb.png')}
        />

          </TouchableOpacity>
          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 1,
          marginTop: 20,
          marginBottom: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center'
        }]}>

        </View>

      </View>

    </SafeAreaView>
  )
}

export default Orbs;