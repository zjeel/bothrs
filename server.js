/* ----------------CONFIG-------------------*/
// init project
var express = require('express');
var bodyParser = require('body-parser');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var app = express();

// Needed middlewares
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/* ----------------ENDPOINT-------------------*/

function chatfuelMessage (text){
  var json = {
   "messages": [
     {"text": text}
   ]
  };
  return json;
}

app.post("/watson", function (req, res) {
  console.log(req.body);
  var json = req.body;
  // access body's key like under:
  var userId = req.body["messenger user id"];
  var queryString = req.body["queryString"];

/* ----------------json is now that of Serverless-------------------*/
// start of logic
  var conversation = new ConversationV1({
    username: process.env.username,
    password: process.env.password,
    version_date: ConversationV1.VERSION_DATE_2017_05_26
  });

  conversation.message({
    input: { text: queryString },
    workspace_id: process.env.workspaceId
   }, function(err, response) {
       if (err) {
         console.error(err);
         // idiom to check nested key existence then randomly sending json or text (when text outputs also exist)
       } else if (((response || {}).context || {}).payload && Math.random() > 0.5 && ((response || {}).output || {}).text.length > 0) {
         res.send(response.context.payload);
       } else {
         var randomIndex = Math.floor((Math.random() * response.output.text.length));
         res.send(chatfuelMessage(response.output.text[randomIndex]));
       }
       });
  });
  
// end of logic
/* ----------------Sent back body-------------------
  response.send(json);
});
*/


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
})
