import axios from 'axios';

const subscriptionKey = 'd6cc0a9f1b634b25bec15cfb580f6050';
const endpoint = 'https://innapropriatecontentdetection.cognitiveservices.azure.com/';
const uriBase = `${endpoint}/vision/v3.0/analyze`;

const scanContent = async (image) => {
    try {
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

        const data = response.data;
        const adultContent = data.adult;
        const isAdultOrRacy = adultContent.isAdultContent || adultContent.isRacyContent;

        return !isAdultOrRacy;
    } catch (error) {
        console.error('Error scanning content:', error);
        return null;
    }
};

export default scanContent;
