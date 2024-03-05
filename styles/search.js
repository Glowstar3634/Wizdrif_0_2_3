import { StyleSheet } from "react-native";

import { COLORS, FONT, SIZES } from "../constants";

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    searchTitle: {
        fontFamily: FONT.bold,
        fontSize: SIZES.xLarge,
        color: COLORS.primary,
    },
    noOfSearchedJobs: {
        marginTop: 2,
        fontFamily: FONT.medium,
        fontSize: SIZES.small,
        color: COLORS.primary,
    },
    loaderContainer: {
        marginTop: SIZES.medium
    },
    footerContainer: {
        marginTop: SIZES.small,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10
    },
    paginationButton: {
        width: 30,
        height: 30,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.tertiary
    },
    paginationImage: {
        width: '60%',
        height: '60%',
        tintColor: COLORS.white
    },
    paginationTextBox: {
        width: 30,
        height: 30,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white
    },
    paginationText: {
        fontFamily: FONT.bold,
        fontSize: SIZES.medium,
        color: COLORS.primary
    },
    header1: {
        fontFamily: FONT.bold,
        fontSize: SIZES.large,
        color: COLORS.primary,
        textAlign: 'center'
    },
    safeContain:{
        alignContent:'center',
        flexDirection: 'column'
    },
    mainPageContain:{
        alignContent:'center',
        flexDirection: 'column',
        backgroundColor: '#1c1b21FF'
    },
    mainPageHeader:{
        color: 'white', 
        fontSize: 25, 
        fontWeight: 'bold',
        alignContent: 'flex-start',
        marginTop:10,
        marginStart:10
    },
    buttonStart: {
        height:45,
        alignItems: 'center',
        alignSelf:"center",
        justifyContent: 'center',
        width:'60%',
        borderRadius: 8,
    },
    buttonText: {
      fontSize: 18,
      fontWeight:'bold',
      color: 'white',
    },
    loginButton: {
        backgroundColor: '#02aeeeFF'
    },
    signUpButton: {
      marginTop: 20,
      backgroundColor: '#652f91FF'
    },
    squareButton: {
        height: 140,
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    startHeaders:{
        fontSize: 50,
        marginTop: 40,
        color: 'black',
        width:'100%',
        textAlign: 'center',
        fontWeight: 'bold',
        alignItems:'center'
    },
    pageTopText:{
        fontSize: 20,
        color: 'white',
        width:'100%',
        textAlign: 'left',
        fontWeight: 'bold'
    },
    startDescs:{
        fontSize: 15,
        marginTop: 10,
        color: 'black',
        width:'100%',
        textAlign: 'center',
        alignItems:'center'
    },
    startInput: {
        height:'100%',
        alignItems: 'center',
        alignSelf:"center",
        justifyContent: 'center',
        width:'100%',
        padding:10,
        color:'black'
    },
    startInputHint: {
        fontSize: 12,
        marginTop: 10,
        marginBottom:3,
        paddingLeft:8,
        color: 'black',
        width:'70%',
        alignSelf:'center',
        alignItems:'center'
    },
    startInputArea: {
        height:50,
        alignItems: 'center',
        alignSelf:"center",
        justifyContent: 'center',
        width:'70%',
        borderRadius: 20,
        backgroundColor: COLORS.light
    },
    postContainer:{
        height:500,
        alignItems: 'center',
        alignSelf:"center",
        justifyContent: 'center',
        width:'85%',
        borderRadius: 20,
        backgroundColor: COLORS.light
    }
});

export default styles;