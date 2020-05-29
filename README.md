# NodeGmailDemo
Repository for developing and testing functionality of the Gmail API with Javascript and Node

## Getting Started
1. clone the repository
`git clone https://github.com/JWindy92/NodeGmailDemo.git`
2. download your credentials from google (https://developers.google.com/gmail/api/quickstart/js)
    * Click "Enable the Gmail API"
    * download credentials.json
    * save credentials.json to NodeGmailDemo directory
        * (I placed mine in data.credentials.json, can put it whereever just change CRED_PATH in dev.js)
3. run dev.js with `node dev.js`, first time will prompt for login and generate token.json file
4. follow link printed in console, then follow prompts in browser, copy paste code into console prompt and should be good to go

The code right now is very ecclectic and is mostly just from me playing around with the api and seeing how to access data.
Moving forward I would like to do some significant refactoring and organization but figured you guys might want to take a look

## Notes
* Quickstart directory is just the quickstart code from the gmail api docs, the authorization code is adapted from here
* dev.js - just to explain whats happening
    * call_api is the main function run inthe code
    * within that function the authorize and getNewToken functions are called for authorization purposes
    * it is called with a callback function provided which is one the functions I wrote to access the data once authenticated
