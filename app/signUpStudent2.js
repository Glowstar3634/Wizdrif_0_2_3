import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Dimensions } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import { Video } from 'expo-av';
import { COLORS } from '../constants';
import {Profile} from './objects/profileObj';
import { auth, database } from '../firebase';
import {ref, set} from 'firebase/database';
import {signOut, onAuthStateChanged, signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword} from '@firebase/auth'

const SignUpStudent2 = ({ route }) => {
  const { newAccount } = route.params;
  console.log(newAccount);
  const navigation = useNavigation();
  const [usernameInput, onUsernameUpdate] = React.useState('');
  const [emailInput, onEmailUpdate] = React.useState('');
  const [passwordInput, onPasswordUpdate] = React.useState('');
  const { width, height } = Dimensions.get('window');
  
  const badWords = ["2g1c","fck", "dck", "2 girls 1 cup","acrotomophilia","alabama hot pocket","alaskan pipeline","anal","anilingus","anus","apeshit","arsehole","DISABLEDass","asshole","assmunch","auto erotic","autoerotic","babeland","baby batter","baby juice","ball gag","ball gravy","ball kicking","ball licking","ball sack","ball sucking","bangbros","bareback","barely legal","barenaked","bastard","bastardo","bastinado","beaner","beaners","beaver cleaver","beaver lips","bestiality","big black","big breasts","big knockers","big tits","bimbos","birdlock","bitches","black cock","blonde action","blonde on blonde action","blowjob","blow job","blow your load","blue waffle","blumpkin","bollocks","bondage","boner","boob","boobs","booty call","brown showers","brunette action","bukkake","bulldyke","bullet vibe","bullshit","bung hole","bunghole","busty","buttcheeks","butthole","camel toe","camgirl","camslut","camwhore","carpet muncher","carpetmuncher","chocolate rosebuds","circlejerk","cleveland steamer","clitoris","clover clamps","clusterfuck","cock","cocks","coprolagnia","coprophilia","cornhole","coon","coons","creampie","cumming","cunnilingus","cunt","cuck","darkie","date rape","daterape","deep throat","deepthroat","dendrophilia","dildo","dingleberry","dingleberries","dirty pillows","dirty sanchez","doggie style","doggiestyle","doggy style","doggystyle","dog style","dolcett","dominatrix","dommes","donkey punch","double dong","double penetration","dp action","dry hump","eat my ass","ecchi","ejaculation","erotic","erotism","escort","eunuch","faggot","fecal","fellatio","feltch","female squirting","femdom","figging","fingerbang","fingering","fisting","foot fetish","footjob","frotting","fuck","fuck buttons","fuckin","fucking","fucktards","fudge packer","fudgepacker","futanari","gang bang","gay sex","genitals","giant cock","girl on top","girls gone wild","goatcx","goatse","god damn","gokkun","golden shower","goodpoop","goo girl","goregasm","grope","group sex","g-spot","hand job","handjob","hard core","hardcore","hentai","homoerotic","honkey","hooker","hot carl","hot chick","how to kill","how to murder","huge fat","humping","incest","intercourse","jack off","jail bait","jailbait","jelly donut","jerk off","jigaboo","jiggaboo","jiggerboo","jizz","juggs","kike","kinbaku","kinkster","kinky","knobbing","leather restraint","leather straight jacket","lemon party","lolita","lovemaking","make me come","male squirting","masturbate","menage a trois","milf","missionary position","motherfucker","mound of venus","mr hands","muff diver","muffdiving","nambla","nawashi","negro","neonazi","nigga","nigger","nig nog","nimphomania","nipple","nipples","nsfw images","nude","nudity","nympho","nymphomania","octopussy","omorashi","one cup two girls","one guy one jar","orgasm","orgy","paedophile","paki","panties","panty","pedobear","pedophile","pegging","penis","phone sex","piece of shit","pissing","piss pig","pisspig","playboy","pleasure chest","pole smoker","ponyplay","poontang","punany","poop chute","poopchute","porn","porno","pornography","prince albert piercing","pubes","pussy","queaf","queef","quim","raghead","raging boner","raping","rapist","rectum","reverse cowgirl","rimjob","rimming","rosy palm","rosy palm and her 5 sisters","rusty trombone","sadism","santorum","schlong","scissoring","semen","shaved beaver","shaved pussy","shemale","shibari","shit","shitblimp","shitty","shota","shrimping","skeet","slanteye","slut","s&m","smut","snatch","snowballing","sodomize","sodomy","splooge","splooge moose","spooge","spread legs","spunk","strap on","strapon","strappado","strip club","style doggy","suck","sucks","suicide girls","sultry women","swastika","swinger","tainted love","taste my","tea bagging","threesome","throating","tied up","tight white","tits","titties","titty","tongue in a","topless","tosser","towelhead","tranny","tribadism","tub girl","tubgirl","tushy","twat","twink","twinkie","two girls one cup","undressing","upskirt","urethra play","urophilia","vagina","venus mound","vibrator","violet wand","vorarephilia","voyeur","vulva","wank","wetback","wet dream","white power","wrapping men","wrinkled starfish","yaoi","yellow showers","yiffy","zoophilia"];

  function badWordChecker(txt) {
    txt = txt.replace(/4/g, "a");
    txt = txt.replace(/3/g, "e");
    txt = txt.replace(/0/g, "o");
    txt = txt.replace(/5/g, "s");
    txt = txt.replace(/7/g, "t");
    txt = txt.replace(/8/g, "b");

    for (var i = 0; i < badWords.length; i++) {
        var word = badWords[i].toLowerCase();
        if (txt.replace(/1/g, "l").toLowerCase().includes(word)) {
            return false;
        }
        if (txt.replace(/1/g, "i").toLowerCase().includes(word)) {
            return false;
        }
    }
    return true;
  }

  function usernameCheck(txt) {
    for (var i = 0; i < txt.length; i++) {
        var n = txt.charCodeAt(i);
        if (!((n >= 65 && n <= 90) || (n >= 97 && n <= 122) || (n >= 48 && n <= 57) || (n === 95))) {
            return false;
        }
    }
    if(txt.length < 3){
      return false;
    }
    return true;
}

function passwordCheck(txt) {
    for (var i = 0; i < txt.length; i++) {
        var n = txt.charCodeAt(i);
        if (!((n >= 65 && n <= 90) || (n >= 97 && n <= 122) || (n >= 33 && n <= 57) || (n >= 91 && n <= 96))) {
            return false;
        }
    }
    if(txt.length < 6){
      return false;
    }
    return true;
}

  const createAccount = async() => {
    if (!usernameCheck(usernameInput) || !badWordChecker(usernameInput)){

    }else if (!passwordCheck(passwordInput)){

    }else{
      try {
        newAccount.setUsername(usernameInput);
        newAccount.setEmail(emailInput);
        newAccount.setPassword(passwordInput);
        console.log(newAccount.getUsername());
        console.log('Creating User 0...');
        console.log('Creating User 2...');
        await createUserWithEmailAndPassword(getAuth(), emailInput, passwordInput);
        console.log('User created successfully!');
        const reference = ref(database, 'users/' + newAccount.getUsername());
        set(reference, newAccount)
        .then(() => {
          console.log('Profile data successfully saved to Firebase');
          navigation.navigate("classroom", {currentUser: newAccount});
        })
        .catch((error) => {
          console.error('Error saving profile data:', error);
        });

      }catch (error) {
        console.error('Authentication error:', error.message);
      }
      
    }
  }
  
  return (
    <SafeAreaView style={{
        flex:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:COLORS.dark
    }}>
    <Video
        source={require('../constants/videos/copy_5CA685BD-EF84-422B-A87D-C06248BA2986.mov')}   // Change this to the path of your video file
        style={{
          position: 'absolute',
          top: -350,
          left: 0,
          bottom: 0,
          right: 0,
          flex: 1,
          zIndex: -99,
          width: width
        }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        shouldPlay = {true}
        isLooping = {true}
        resizeMode="cover"
      />
        <View style={{
        alignContent:'center',
        flexDirection: 'column',
        justifyContent:'flex-start',
        flex:1,
        width: '90%', height: '30%'
        }}>
          <Image
            style={{ width: '50%', height: '50%', alignSelf:"center"}}
            resizeMode="contain"
            source={require('../constants/images/brand/wizdriflogo_png.png')}
          />
        </View>
        
        <View style={{
        alignContent:'space-around',
        flexDirection: 'column',
        justifyContent:'flex-start',
        flex:3,
        width:'100%',
        backgroundColor:COLORS.superDark,
        
        borderTopRightRadius: 70,
        }}>
        <View style={{flex:1}}>
        <TouchableOpacity
          style={{}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 55, height: 55}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        
        </View>
        <View style={{flex:4}}>
        <Text style={[styles.startHeaders,{color: COLORS.white}]}>Create your account</Text>

        <Text style={[styles.startDescs,{color: COLORS.white}]}>Make a username and password, and log in!</Text>
        </View>

        <View style={{flex:6}}>
        <Text style={[styles.startInputHint,{color: COLORS.white}]}>Username</Text>
        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={usernameInput => onUsernameUpdate(usernameInput)}
            defaultValue= {usernameInput}
          />
        </View>

        <Text style={[styles.startInputHint,{color: COLORS.white}]}>Email</Text>
        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={emailInput => onEmailUpdate(emailInput)}
            defaultValue= {emailInput}
          />
        </View>

        <Text style={[styles.startInputHint,{color: COLORS.white}]}>Password</Text>
        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={passwordInput => onPasswordUpdate(passwordInput)}
            secureTextEntry={true}
            defaultValue= {passwordInput}
          />
        </View>

        </View>
        <View style={{flex:2}}>
        <TouchableOpacity
          style={[styles.buttonStart, styles.loginButton]}
          onPress={createAccount}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        </View>

          </View>
    </SafeAreaView>
  );
};

export default SignUpStudent2;