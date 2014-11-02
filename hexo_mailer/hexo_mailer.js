var fs = require('fs');
var csvFile = fs.readFileSync("friends_list.csv", "utf8");
var emailTemplate = fs.readFileSync('email_Template.ejs', 'utf8');
var ejs = require('ejs');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('TpXfEK8QRAkYeiWqTgMwOA');
var FeedSub = require('feedsub');  
var blogContent = new FeedSub('http://gschoff.github.io/atom.xml', {
        emitOnStart: true
});

var latestPosts = [];
var customizedTemplate; 

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      //console.log(message);
       console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
}



 


function csvParse(csvFile){
   var arr = csvFile.split("\n");
   var keys = arr[0].split(",");
   var vals =[]; 
   var arr_obj = []; 
     for (var j = 1; j<arr.length; j++){ 
      vals.push(arr[j].split(",")); 
     }
     for(var g=0;  g<vals.length; g++){
      var obj={}; 
        for (var i=0; i<keys.length; i++){
        obj[keys[i]]=vals[g][i]; 
        }
        arr_obj.push(obj)
      }
  return(arr_obj)
}

blogContent.read(function(err,blogPosts){
 
    blogPosts.forEach(function(post){
       
      var current_date = new Date(); 
      var post_dates = new Date(post.published)

       if((current_date - post_dates) < 604800000){
        latestPosts.push(post); 
       }
    })



      friendList = csvParse(csvFile);

    friendList.forEach(function(row){

      
        firstName = row["firstName"];
        monthsSinceContact = row["monthsSinceContact"];


        customizedTemplate = ejs.render(emailTemplate, 
                        { firstName: firstName,  
                          monthsSinceContact: monthsSinceContact, 
                          latestPosts: latestPosts
        });

sendEmail(firstName, 'grant.schoffelen@gmail.com', 'Sender', 'grant.schoffelen@gmail.com', 'Hello', customizedTemplate)
        
    })
})

