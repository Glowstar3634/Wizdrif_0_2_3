import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

const subscriptionKey = 'd6cc0a9f1b634b25bec15cfb580f6050';
const endpoint = 'https://innapropriatecontentdetection.cognitiveservices.azure.com/';
const uriBase = `${endpoint}/vision/v3.0/analyze`;

const resizeImage = async (imageUri, width, height) => {
  try {
    if (typeof imageUri !== 'string') {
      throw new TypeError(`The "uri" argument must be a string: ${imageUri}`);
    }
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width, height } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};

const scanContent = async (imageUri) => {
  try {
    console.log('Resizing image...');
    const resizedImageUri = await resizeImage(imageUri, 1024, 1024); // Adjust the dimensions as needed
    console.log("Resized Image: ", resizedImageUri)

    const fileInfo = await FileSystem.getInfoAsync(resizedImageUri);
    const { uri: localUri } = fileInfo;
    console.log('Encoding...');
    const imageBase64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const octetStream = base64ToOctetStream(imageBase64);

    console.log('Initiating...');
    const params = {
      visualFeatures: 'Adult', // Adjust as needed
      details: '',
      language: 'en',
    };

    const apiResponse = await axios.post(uriBase, octetStream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      params,
    });

    console.log('Retrieving results...');

    const data = apiResponse.data;
    const adultContent = data.adult;
    const isAdultOrRacy = adultContent.isAdultContent || adultContent.isRacyContent;

    return !isAdultOrRacy;
  } catch (error) {
    console.error('Error scanning content:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    if (error.request) {
      console.error('Request data:', error.request);
    }
    return null;
  }
};

const base64ToOctetStream = (base64String) => {
  const octetStream = new Uint8Array(Buffer.from(base64String, 'base64'));
  return octetStream;
};

export default scanContent;