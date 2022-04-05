# What is this?
This project contains source code for adding an AWS translate block to [Cloudinary MediaFlows](https://cloudinary.com/labs/mediaflows), it uses the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) for deplying a lambda to AWS. The lambda translates the source text into the requested languages. 

# Inputs
The lambda accepts the following parameters:

- `sourceText` - Text to be translated
- `sourceLanguage` - Source language code, for example en. See the [AWS Translate documentation](https://docs.aws.amazon.com/translate/latest/dg/what-is.html) for a list of supported languages
- `outputLanguages` - Comma seperated list of out language codes
- `callback_webhook` - Webhook to send response, if using MediaFlows this is automatically passed
- (optional) `dynamic_template_data` - JSON object with extra data that will be passed back as-is in the reponse

# Response
The response contains the following:
- `translatedText` - an Array of objects containing the `language` and `translatedText` for each language code provided in `outputLanguages`
- (optional) The `dynamic_template_data` will be added to the response unchanged.

# Example request/response
With input values of:
```
{  
  "sourceText": "Flowers with a bee",
  "sourceLanguage": "en", 
  "outputLanguages": "he,es",
  dynamic_template_data: {
    "metadata_field": "description"
  },
  callback_webhook: <<mediaflows.callback.url>> 
}
```

The `callback_webhook` url will be called with the data:
```
{ 
  "translatedText": [ 
    { "language": "he", "translatedText": "פרחים עם דבורה" }, 
    { "language": "es", "translatedText": "Flores con abeja" } 
  ], 
  "metadataField": "description" 
}
```

# Updating and Deployment
This project used the [SAM getting started sample project](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-hello-world.html) as a starting point, see the [SAM Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) for more information on intalling the CLI tool.

Run `npm install` to install the node packages

Updates to the lambda should be made in `src/handlers/translate-string.js`

To test changes run `npm test`, when running the tests the `translate:TranslateText` AWS permission is required.

To deploy the changes run `sam build` and then run `sam deploy --guided` to configure where the application should be deployed. The SAM CLI tool needs to have the [correct permissions](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-permissions.html) to deploy.

## Resources
- Blog post

## License
Released under the MIT license.