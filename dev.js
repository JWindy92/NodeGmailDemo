const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json'; // Where the token will be stored for easier login after first time
const CRED_PATH = 'data/credentials.json'; // Make sure this path is correct

function call_api(callback) {
    fs.readFile(CRED_PATH, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), callback);
    })
}

// MAIN FUNCTION CALLED HERE
call_api(last_message);

// FUNCTIONS DECLARED BELOW 


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    console.log(client_secret)
    console.log(client_id)
    console.log(redirect_uris)
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.labels.list({
        userId: 'me'
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        console.log("labels");
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}
/**
 * Just a function that currently parses and prints desired data to the console
 * Would handle updating the DOM in the future
 * is currently specifically tailored to handling a single messages headers
 * 
 * @param  {json data} data The data to be parsed
 */
function update_ui(data){
    let desired_vals = ['Date', 'From', 'Subject'];
    let parsed_data = {}
    data.forEach((item, index) => {
        if (desired_vals.includes(item.name)) {
            parsed_data[item.name] = data[index].value;
            // console.log(item.name, ` @ index ${index}`)
        }
    });
    console.log(parsed_data)
}
/**
 * Grabs headers from an email message and passes them to the update_ui function
 * In future versions, will probably replace update_ui function with a callback for 
 * more flexibility
 * 
 * @param  {} auth An authorized OAuth2 client.
 * @param  {} msg_id the id of the desired message.
 */
function get_message_headers(auth, msg_id) {
    const gmail = google.gmail({version: 'v1', auth});
    var request = gmail.users.messages.get({
        userId: 'me',
        id: msg_id
    });
    request.then(ret => {
        update_ui(ret.data.payload.headers)
    })
}
/**
 * Retrieves a message via it's id and prints the contents to the console
 * 
 * @param  {} auth An authorized OAuth2 client.
 * @param  {} msg_id the id of the desired message
 */
function get_message(auth, msg_id) {
    const gmail = google.gmail({version: 'v1', auth});
    var request = gmail.users.messages.get({
        userId: 'me',
        id: msg_id
    });
    request.then(ret => {
        console.log(ret)
    });
}


/**
 * Retrieves the most recent message in the inbox
 * passes the id to the get_message_header function
 * TODO: add parameter to specify number of messages retrieved via maxResults field
 * TODO: replace hard coded function (currently get_message_headers) with a callback for more flexibility
 * 
 * @param  {} auth An authorized OAuth2 client.
 */
function last_message(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    var request = gmail.users.messages.list({
        userId : 'me',
        maxResults: 1
    });
    
    request.then(ret => {
        let ids = [];
        let messages = ret.data.messages;
        messages.forEach((item, index) => {
            ids.push(item.from)
            get_message_headers(auth, item.id)
        })
    })
}



