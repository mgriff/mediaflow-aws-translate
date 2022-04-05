const fetch = require('node-fetch'); 

module.exports = async function (event, cloudinary,  callback) {
    try {
        const url = `https://res.cloudinary.com/${ cloudinary.config().cloud_name }/raw/upload/config/media-flows/translation-settings.json`;

        const response = await fetch(url);

        if (response.status != 200) {
            callback({ 
                "is_error": true, 
                "message": `Unable to config file ${url}, status code: ${response.status}` 
            });
        }
        const body = await response.json();

        callback(null, { config: body } );
    } catch (error) {
        callback(error, null);
    }
}

/**
 * Used to test snippet
 */
class CloudinaryMock {
    
    constructor(cloudName) {
        this.cloud_name = cloudName;
    }

    config() {
        return {
            cloud_name: this.cloud_name
        }
    }
}

const cldObject = new CloudinaryMock("matt-dam");

module.exports(null, cldObject, (error, data) => {
    console.log(error);
    console.log(data);
})