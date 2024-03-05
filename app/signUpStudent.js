import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants';
import { Profile} from "./objects/profileObj";

const SignUpStudent = ({route}) => {
  const { newAccount } = route.params;
  const navigation = useNavigation();
  const [fnameInput, onFNameUpdate] = React.useState('');
  const [lnameInput, onLNameUpdate] = React.useState('');
  const [ageInput, onAgeUpdate] = React.useState(0);
  const [gradeInput, onGradeUpdate] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [pickGrade, setPick] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const badWords = ["2g1c","fck", "dck", "2 girls 1 cup","acrotomophilia","alabama hot pocket","alaskan pipeline","anal","anilingus","anus","apeshit","arsehole","DISABLEDass","asshole","assmunch","auto erotic","autoerotic","babeland","baby batter","baby juice","ball gag","ball gravy","ball kicking","ball licking","ball sack","ball sucking","bangbros","bareback","barely legal","barenaked","bastard","bastardo","bastinado","beaner","beaners","beaver cleaver","beaver lips","bestiality","big black","big breasts","big knockers","big tits","bimbos","birdlock","bitches","black cock","blonde action","blonde on blonde action","blowjob","blow job","blow your load","blue waffle","blumpkin","bollocks","bondage","boner","boob","boobs","booty call","brown showers","brunette action","bukkake","bulldyke","bullet vibe","bullshit","bung hole","bunghole","busty","buttcheeks","butthole","camel toe","camgirl","camslut","camwhore","carpet muncher","carpetmuncher","chocolate rosebuds","circlejerk","cleveland steamer","clitoris","clover clamps","clusterfuck","cock","cocks","coprolagnia","coprophilia","cornhole","coon","coons","creampie","cumming","cunnilingus","cunt","cuck","darkie","date rape","daterape","deep throat","deepthroat","dendrophilia","dildo","dingleberry","dingleberries","dirty pillows","dirty sanchez","doggie style","doggiestyle","doggy style","doggystyle","dog style","dolcett","dominatrix","dommes","donkey punch","double dong","double penetration","dp action","dry hump","eat my ass","ecchi","ejaculation","erotic","erotism","escort","eunuch","faggot","fecal","fellatio","feltch","female squirting","femdom","figging","fingerbang","fingering","fisting","foot fetish","footjob","frotting","fuck","fuck buttons","fuckin","fucking","fucktards","fudge packer","fudgepacker","futanari","gang bang","gay sex","genitals","giant cock","girl on top","girls gone wild","goatcx","goatse","god damn","gokkun","golden shower","goodpoop","goo girl","goregasm","grope","group sex","g-spot","hand job","handjob","hard core","hardcore","hentai","homoerotic","honkey","hooker","hot carl","hot chick","how to kill","how to murder","huge fat","humping","incest","intercourse","jack off","jail bait","jailbait","jelly donut","jerk off","jigaboo","jiggaboo","jiggerboo","jizz","juggs","kike","kinbaku","kinkster","kinky","knobbing","leather restraint","leather straight jacket","lemon party","lolita","lovemaking","make me come","male squirting","masturbate","menage a trois","milf","missionary position","motherfucker","mound of venus","mr hands","muff diver","muffdiving","nambla","nawashi","negro","neonazi","nigga","nigger","nig nog","nimphomania","nipple","nipples","nsfw images","nude","nudity","nympho","nymphomania","octopussy","omorashi","one cup two girls","one guy one jar","orgasm","orgy","paedophile","paki","panties","panty","pedobear","pedophile","pegging","penis","phone sex","piece of shit","pissing","piss pig","pisspig","playboy","pleasure chest","pole smoker","ponyplay","poontang","punany","poop chute","poopchute","porn","porno","pornography","prince albert piercing","pubes","pussy","queaf","queef","quim","raghead","raging boner","raping","rapist","rectum","reverse cowgirl","rimjob","rimming","rosy palm","rosy palm and her 5 sisters","rusty trombone","sadism","santorum","schlong","scissoring","semen","shaved beaver","shaved pussy","shemale","shibari","shit","shitblimp","shitty","shota","shrimping","skeet","slanteye","slut","s&m","smut","snatch","snowballing","sodomize","sodomy","splooge","splooge moose","spooge","spread legs","spunk","strap on","strapon","strappado","strip club","style doggy","suck","sucks","suicide girls","sultry women","swastika","swinger","tainted love","taste my","tea bagging","threesome","throating","tied up","tight white","tits","titties","titty","tongue in a","topless","tosser","towelhead","tranny","tribadism","tub girl","tubgirl","tushy","twat","twink","twinkie","two girls one cup","undressing","upskirt","urethra play","urophilia","vagina","venus mound","vibrator","violet wand","vorarephilia","voyeur","vulva","wank","wetback","wet dream","white power","wrapping men","wrinkled starfish","yaoi","yellow showers","yiffy","zoophilia"];
  
  const handleDateChange = (event, date) => {
    if (date !== undefined) {
      setSelectedDate(date);
      const age = calculateAge(date);
      onAgeUpdate(age);
    }
    setShow(false);
  };

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


  function nameCheck(txt) {
    for (var i = 0; i < txt.length; i++) {
        var n = txt.charCodeAt(i);
        if (!((n >= 65 && n <= 90) || (n >= 97 && n <= 122))) {
            return false;
        }
    }
    if (txt.length == 0){return false}

    return true;
  }

  const next = () => {
    if (nameCheck(fnameInput) && nameCheck(lnameInput) && badWordChecker(fnameInput) && badWordChecker(lnameInput)){
      newAccount.setFirstName(fnameInput);
    newAccount.setLastName(lnameInput);
    newAccount.setAge(ageInput);
    newAccount.setGrade(gradeInput);

    navigation.navigate("signUpStudent2",{newAccount: newAccount});
    }
    else {

    }
  }

  const handleGradeChange = (event, grade) => {
    onGradeUpdate(grade);
    setPick(false);
  };
  
  const showDateSelector = () => {
    setShow(true);
  }

  const showGradeSelector = () => {
    setPick(true);
  }

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <SafeAreaView style={{
        flex:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:COLORS.dark
    }}>
        <View style={{
        alignContent:'center',
        flexDirection: 'column',
        justifyContent:'flex-start',
        flex:1,
        width: '90%', height: '30%'
        }}>
          <Image
            style={{ width: '50%', height: '50%', alignSelf:"center"}}
            source={require('../constants/images/brand/wizdriflogo_png.png')}
          />
        </View>
        
        <View style={{
        alignContent:'space-around',
        flexDirection: 'column',
        justifyContent:'flex-start',
        flex:4,
        width:'100%',
        backgroundColor:COLORS.white,
        
        borderTopRightRadius: 70,
        }}>
        <View style={{flex:1}}>
        <TouchableOpacity
          style={{}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 55, height: 55}}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        
        </View>
        <View style={{flex:2}}>
        <Text style={[styles.startHeaders, {marginTop: 0}]}>Welcome!</Text>

        <Text style={styles.startDescs}>Please enter your name, age, and grade.</Text>
        </View>

        <View style={{flex:6}}>
        <Text style={styles.startInputHint}>First Name</Text>
        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={fnameInput => onFNameUpdate(fnameInput)}
            defaultValue= {fnameInput}
          />
        </View>

        <Text style={styles.startInputHint}>Last Name</Text>

        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={lnameInput => onLNameUpdate(lnameInput)}
            defaultValue= {lnameInput}
          />
        </View>

        <Text style={styles.startInputHint}>Age - You are {calculateAge(selectedDate)} years old</Text>
        <View style={[styles.startInputArea, {backgroundColor: COLORS.white}]}>
        {show && (<DateTimePicker
  style={{ width:'70%', height:'100%', padding:10, alignSelf:"flex-start"}}
  value={selectedDate}
  mode="date"
  placeholder="Select date"
  format="YYYY-MM-DD"
  minDate="1924-01-01"
  maxDate="2023-12-31"
  confirmBtnText="Confirm"
  cancelBtnText="Cancel"
  customStyles={{
    dateIcon: {
      position: 'absolute',
      left: 0,
      top: 4,
      marginLeft: 0,
    },
    dateInput: {
      marginLeft: 0,
    }
  }}
  onChange={handleDateChange}
/>)}
{!show && (<TouchableOpacity
          style={[styles.buttonStart, styles.loginButton]}
          onPress={showDateSelector}
        >
          <Text style={styles.buttonText}>Enter Birthdate</Text>
        </TouchableOpacity>)}
        </View>
        <Text style={styles.startInputHint}>Grade</Text>

        <View style={[styles.startInputArea, {backgroundColor: COLORS.white}]}>
        {pickGrade && (<Picker
        selectedValue={gradeInput}
        style={{ height: 50, width: 150 }}
        onValueChange={handleGradeChange}
      >
        <Picker.Item label="Elementary" value="0" />
        <Picker.Item label="6th Grade" value="6" />
        <Picker.Item label="7th Grade" value="7" />
        <Picker.Item label="8th Grade" value="8" />
        <Picker.Item label="9th Grade" value="9" />
        <Picker.Item label="10th Grade" value="10" />
        <Picker.Item label="11th Grade" value="11" />
        <Picker.Item label="12th Grade" value="12" />
        <Picker.Item label="College or University" value="13" />
      </Picker>)}
      {!pickGrade && (<TouchableOpacity
          style={[styles.buttonStart, styles.loginButton]}
          onPress={showGradeSelector}
        >
          <Text style={styles.buttonText}>Choose your grade</Text>
        </TouchableOpacity>)}
        </View>
        </View>

        <View style={{flex:1}}>
        <TouchableOpacity
          style={[styles.buttonStart, styles.loginButton]}
          onPress={next}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        </View>

          </View>
    </SafeAreaView>
  );
};

export default SignUpStudent;