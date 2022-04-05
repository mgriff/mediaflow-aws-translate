require('dotenv').config()
const { default: axios } = require('axios');
const lambda = require('../../../src/handlers/translateString.js');

jest.mock("axios");

const CALLBACK_URL = "https://dummy.url";

// This includes all tests for translateStringHandler()
describe('successful translation use case', function () {
    beforeAll(() => {
        axios.post = jest.fn();
        jest.spyOn(console, 'debug').mockImplementation(() => {}); //Ignoring debug logs to reduce noise
    })
    
    afterEach(() => {
        axios.post.mockClear();
    });

    it('should successful translate two languages', async () => {
        expect.assertions(5);
        // Invoke translateStringHandler()
        const event = {
            "sourceText": "Table of breakfast food, including savoury and sweet plates",
            "sourceLanguage": "en",
            "outputLanguages": "es,he",
            "callback_webhook": CALLBACK_URL,
            "dynamic_template_data": { "foo":"bar" }
        }

        const expectedText_es = 'Tabla de comida para el desayuno, incluidos platos salados y dulces';
        const expectedText_he = 'שולחן אוכל לארוחת בוקר, כולל צלחות מתוקות ומלוחות';


        const result = await lambda.handler(event);
        
        expect(axios.post.mock.calls.length).toBe(1);

        const responseSent = axios.post.mock.calls[0][1]; //retrieve the data sent to webhook
        expect(responseSent).toHaveProperty('translatedText');
        expect(responseSent.translatedText).toEqual(expect.arrayContaining([ expect.objectContaining( { "language": "es", "translatedText": expectedText_es } )]));
        expect(responseSent.translatedText).toEqual(expect.arrayContaining([ expect.objectContaining( { "language": "he", "translatedText": expectedText_he } )]));

        expect(responseSent).toHaveProperty('foo','bar');
    });
})

describe('check the validations', function (){
    beforeAll(() => {
        axios.post = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {}); //Expecting errors so no need to log
    })
    afterEach(() => {
        axios.post.mockClear();
    });
      
    it('should return a custom error if the sourceText is not present', async () => {
        expect.assertions(1);
        const event = {
            sourceLanguage: "en",
            outputLanguages: "es,he",
            callback_webhook: CALLBACK_URL
        }
        await lambda.handler(event);

        //undefined as the webhook will not have been set
        expect(axios.post).toHaveBeenCalledWith(CALLBACK_URL,{ 
            "is_error": true, 
            "message":'Missing or empty argument: sourceText'
        });
    });

    it('should return a custom error if the sourceText is empty', async () => {
        expect.assertions(1);
        const event = {
            sourceText: "",
            sourceLanguage: "en",
            outputLanguages: "es,he",
            callback_webhook: CALLBACK_URL
        }

        await lambda.handler(event);
        
        expect(axios.post).toHaveBeenCalledWith(CALLBACK_URL,{ 
            "is_error": true, 
            "message":'Missing or empty argument: sourceText'
        }) 
    });

    it('should return a custom error if the sourceLanguage is not present', async () => {
        expect.assertions(1);
        const event = {
            sourceText: "Table of breakfast food, including savoury and sweet plates",
            outputLanguages: "es,he",
            callback_webhook: CALLBACK_URL
        }
        
        await lambda.handler(event);

        expect(axios.post).toHaveBeenCalledWith(CALLBACK_URL,{ 
            "is_error": true, 
            "message":'Missing or empty argument: sourceLanguage'
        })
    });

    it('should return a custom error if the sourceLanguage is empty', async () => {
        expect.assertions(1);
        const event = {
            sourceText: "Table of breakfast food, including savoury and sweet plates",
            sourceLanguage: "",
            outputLanguages: "es,he",
            callback_webhook: CALLBACK_URL
        }

        await lambda.handler(event);

        expect(axios.post).toHaveBeenCalledWith(CALLBACK_URL,{ 
            "is_error": true, 
            "message":'Missing or empty argument: sourceLanguage'
        })

    });

    it('should return a custom error if the outputLanguages is not present', async () => {
        expect.assertions(1);
        const event = {
            sourceText: "Table of breakfast food, including savoury and sweet plates",
            sourceLanguage: "en",
            callback_webhook: CALLBACK_URL
        }

        await lambda.handler(event);

        expect(axios.post).toHaveBeenCalledWith(CALLBACK_URL,{ 
            "is_error": true, 
            "message":'Missing or empty argument: outputLanguages'
        })
    });

    it('should return a custom error if the outputLanguages is empty', async () => {
        expect.assertions(1);
        const event = {
            sourceText: "Table of breakfast food, including savoury and sweet plates",
            sourceLanguage: "en",
            outputLanguages: "",
            callback_webhook: CALLBACK_URL
        }

        await lambda.handler(event);

        expect(axios.post).toHaveBeenCalledWith(CALLBACK_URL,{ 
            "is_error": true, 
            "message":'Missing or empty argument: outputLanguages'
        })

    });
});