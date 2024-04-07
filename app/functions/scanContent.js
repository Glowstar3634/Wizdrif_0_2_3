import axios from 'axios';

const subscriptionKey = 'd6cc0a9f1b634b25bec15cfb580f6050';
const endpoint = 'https://innapropriatecontentdetection.cognitiveservices.azure.com/';
const uriBase = `${endpoint}/vision/v3.0/analyze`;

const scanContent = async (image) => {
    try {
      console.log('Initiating...');
        const params = {
            visualFeatures: 'Adult', // Adjust as needed
            details: '',
            language: 'en',
        };

        const response = await axios.post(uriBase, image, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            },
            params,
        });

        console.log('Retriving results...');

        const data = response.data;
        const adultContent = data.adult;
        const isAdultOrRacy = adultContent.isAdultContent || adultContent.isRacyContent;

        return !isAdultOrRacy;
    } catch (error) {  //fix issue with image being TOO LARGE
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

const blobToOctetStream = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const octetStream = new Uint8Array(arrayBuffer);
      resolve(octetStream);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export default scanContent;
