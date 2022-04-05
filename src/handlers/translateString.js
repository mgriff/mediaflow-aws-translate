const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate')
const axios = require('axios').default;

const validateEventSchema = function(event) {
    console.debug("Validating event")
    console.debug(event)    
    if(event.sourceText === undefined || event.sourceText === "")
        throw new Error("Missing or empty argument: sourceText")

    if(event.sourceLanguage === undefined || event.sourceLanguage === "")
        throw Error("Missing or empty argument: sourceLanguage")

    if(event.outputLanguages === undefined || event.outputLanguages === "")
        throw Error('Missing or empty argument: outputLanguages')

    if(event.callback_webhook === undefined) 
        throw Error('Missing argument: callback_webhook')
}

const translateText = async function(sourceLanguage, targetLanguage, sourceText) {
    console.debug(`Translating to ${targetLanguage}`)
    const params = {
        "Text": sourceText,
        "SourceLanguageCode": sourceLanguage,
        "TargetLanguageCode": targetLanguage
   };

   const client = new TranslateClient({region:'us-east-1'});
   const command = new TranslateTextCommand(params);  

   const data = await client.send(command);

   console.debug(data);

   return {
        "language": data.TargetLanguageCode,
        "translatedText": data.TranslatedText
    }
}

/**
 * A Lambda function that takes a string/source language and returns the translated text for the requested languages.
 */
 exports.handler = async (event) => {
    try {
        validateEventSchema(event);

        const translatedPromises = [];

        event.outputLanguages.split(',').forEach(outputLanguage => {
            translatedPromises.push(translateText(event.sourceLanguage, outputLanguage ,event.sourceText));
        });  
        const translatedResults = await Promise.all(translatedPromises);

        const response = {
            ...event.dynamic_template_data
        } //dynamic_template_data allows uses of the media flow to pass back data for specific calls

        response.translatedText = translatedResults;

        await axios.post(event.callback_webhook, response);
    } catch (error) {
        console.error('Error running translation',error);
        const errorObject = { 
            "is_error": true, 
            "message": error.message 
        }

        if(event.callback_webhook !== undefined) {
            await axios.post(event.callback_webhook, errorObject);
        }
    }
        
}
