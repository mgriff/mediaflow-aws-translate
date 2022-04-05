'use strict'

module.exports = function (event, cloudinary,  callback) {

    const config = event.data.mf_qVkNNZn34P2u0ExZIiAb.config; //The configuration file loaded in a previous block
    const assetData = event.data.current_payload; //Load asset data from previous block
    
    if(assetData.metadata !== undefined) { //check if metadata has been set, end flow if not
        const response = {
            "public_id": assetData.public_id,
            "resource_type": assetData.resource_type,
            "type": assetData.type,
            "fields_to_translate": []
        }; //prepare the response in the required format for the next flow
        
        for(const field of config.metadata_fields_to_translate) {  //Loop over each metadata field defined in the configuration file 
            const translationSettings = {
                "metadataField": field
            }
            
            for(const language of config.languages) { //Loop over each language defined in the configuration file
                const currentLangField = assetData.metadata[`${field}_${language}`];
                if(currentLangField === undefined) { //This field hasn't been set so we should translate it
                    if(translationSettings.outputLanguages === undefined) {
                        translationSettings.outputLanguages = language
                    } else {
                        translationSettings.outputLanguages += `,${language}`;
                    }
                } else if (translationSettings.sourceLanguage === undefined) { //This field has been set and it is the first language we find so we should use it as the sourceText
                    translationSettings.sourceText = currentLangField
                    translationSettings.sourceLanguage = language
                }
            }
            
            if(translationSettings.sourceLanguage !== undefined && translationSettings.outputLanguages !== undefined) { //if we have a sourceLanguage and at least one field to translate we should add this field to the list of translations
                response.fields_to_translate.push(translationSettings)
            }
        }
        
        if(response.fields_to_translate.length > 0) { //continue the flow as long as there is at least one field to translate
            callback(null, response) 
        }
    }
}

/**
 * Used to test snippet
 */
const eventData = {
    data: {
        mf_qVkNNZn34P2u0ExZIiAb: { "config": { "metadata_fields_to_translate": [ "alt", "description" ], "languages": [ "he", "es", "en" ] } },
        current_payload: { "original_filename": "photo-1599420186946-7b6fb4e297f0", "resource_type": "image", "pages": 1, "height": 640, "format": "jpg", "metadata": { "category": "employee", "status": "pending_approval", "description_en": "Goodbye", "alt_en": "Hello" }, "coordinates": { "faces": [] }, "version_id": "cdd9d56c6940434fa8159a8394a95a8a", "width": 427, "notification_type": "upload", "moderation": [ { "status": "pending", "kind": "manual" } ], "tags": [], "secure_url": "https://res.cloudinary.com/matt-dam/image/upload/v1642437679/photo-1599420186946-7b6fb4e297f0.jpg", "version": 1642437679, "created_at": "2022-01-17T16:41:19Z", "asset_id": "49af3185fad50addf2aad9383e3e0988", "request_id": "82cf2ab0bd714db18699958ca432b6bd", "type": "upload", "api_key": "452455817359935", "placeholder": false, "access_mode": "public", "url": "http://res.cloudinary.com/matt-dam/image/upload/v1642437679/photo-1599420186946-7b6fb4e297f0.jpg", "etag": "82e331f385bf63cb1d88233db191c492", "bytes": 64476, "public_id": "photo-1599420186946-7b6fb4e297f0", "timestamp": "2022-01-17T16:41:19+00:00", "context": {} }
    }
}

module.exports(eventData, {}, (error, data) => {
    console.log(error);
    console.log(data);
})
