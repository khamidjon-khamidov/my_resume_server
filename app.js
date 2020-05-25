require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https");
const admin = require("firebase-admin")

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static("public"));

// ******************* Initialize firebase **********************
const service_account = {
    "type": "service_account",
    "project_id": "cvforkhamidjon",
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL, 
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }

  admin.initializeApp({
      credential: admin.credential.cert(service_account),
      databaseURL: "https://cvforkhamidjon.firebaseio.com"
  })

  var payload = {
      data: {
          khamidjon: "",
          mtoken: ""
      }
  }

  var options = {
      priority: "high",
      timeToLive: 60*60*24*15
  }

  app.get("/sendMessage/:token/:message", function (req, res) {
    let token = req.params.token
    let message = req.params.message

    payload.data.mtoken = decodeURIComponent(token)
    payload.data.khamidjon = decodeURIComponent(message)

    admin.messaging().sendToDevice(token, payload, options)
    .then(function(response){
        console.log("Khamidjon: ", response)
        res.send({ok: true})
    })
    .catch(function(error){
        res.status(404).send({message: "No Send"})
    })
})

// ********************************************************************
mongoose.connect(process.env.MONGO_DB_LINK, { useNewUrlParser: true, useUnifiedTopology: true });

// ---------------------------------- schemas ----------------------------------
const isUpdatedSchema = {
    isUpdate: Number,
    cv_link: String
}

const aboutMeSchema = {
    dateOfBirth: String,
    address: String,
    email: String,
    phone: String,
    hobbies: String,
    education: [
        {
            name: String,
            link: String
        }
    ],
    pictureLink: String,
    description: String,
    cvLink: String
}

const honorsSchema = {
    listId: String,
    listTitle: String,
    hList: [
        {
            itemId: String,
            itemTitle: String,
            itemDescription: String,
            itemLink: String
        }
    ]
}

const postsSchema = {
    postId: String,
    postDescription: String,
    postLink: String
}

const projectsSchema = {
    projectId: String,
    projectTime: String,
    projectTitle: String,
    projectDes: String,
    projectLink: String,
    projectGitLink: String
}

const skillsSchema = {
    skillId: String,
    name: String,
    percentage: Number,
    list: [String],
}
// -----------------------------------------------------------------------------------------------

// --------------------------------------------- Models ---------------------------------------------
const IsUpdate = mongoose.model("IsUpdated", isUpdatedSchema, "shouldUpdate");
const AboutMeSchema = mongoose.model("AboutMeSchema", aboutMeSchema, "about_me")
const Honor = mongoose.model("Honor", honorsSchema)
const Post = mongoose.model("Post", postsSchema);
const Project = mongoose.model("Project", projectsSchema);
const Skill = mongoose.model("Skill", skillsSchema)
// -------------------------------------------------------------------------------------------------------

// --------------------------------------------- REST APIs -------------------------------
const handleRes = (err, myData, res) => {
    if (!err) {
        res.send(myData)
    } else {
        res.status(404).send({
            message: "Error"
        })
    }
}

app.get("/someone/shouldupdate/:os", function (req, res) {
    IsUpdate.find(function (err, myData) {
        console.log("Inside should update")
        var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress
        let url = process.env.ENTRIES_URL + "platform: " + req.params.os + " \nIP: " + escape(ip);

        console.log("tried to answer");

        request = https.get(url, function (response) {
            var responseString = "";

            response.on("data", function (data) {
                responseString += data;
            });
            response.on("end", function () {
                console.log(responseString);
            });
        });

        if (!err) {
            res.send(myData)
        } else {
            res.status(404).send({
                message: "Error"
            })
        }
    });
})

app.get("/someone/sendMessage/:message", function (req, res) {
    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress
    let url = process.env.EMPLOYER_URL + req.params.message + " Address: " + escape(ip);
    
    request = https.get(url, function (response) {
        let responseString = "";

        response.on("data", function (data) {
            responseString += data;
        });
        response.on("end", function () {
            var resObj = JSON.parse(responseString);
            if (resObj.ok === true) {
                res.send({ ok: true })
            } else {
                res.status(404).send({ message: "No Send" })
            }
        });
    });
})

app.get("/someone/aboutme", function (req, res) {
    AboutMeSchema.find(function (err, myData) {
        handleRes(err, myData, res)
    });
})

app.get("/someone/honors", function (req, res) {
    Honor.find(function (err, myData) {
        handleRes(err, myData, res)
    });
})

app.get("/someone/posts", function (req, res) {
    Post.find(function (err, myData) {
        handleRes(err, myData, res)
    });
})

app.post("/someone/posts", function (req, res) {

    if (process.env.AUTH_CODE === req.headers['authenticate']) {
        var newPost = new Post({
            postId: req.body.postId,
            postDescription: req.body.postDescription,
            postLink: req.body.postLink
        });

        newPost.save(function (err) {
            if (!err) {
                res.send({ message: "Success" });
            } else {
                res.send({ message: "Error" });
            }
        });

    } else {
        res.send({ message: "You are not Khamidjon. Sorry!" })
    }
});

app.delete("/someone/posts", function (req, res) {

    if (process.env.AUTH_CODE === req.headers['authenticate']) {
        Post.deleteOne(
            { postId: req.params.postId },
            function (err) {
                if (!err)
                    res.send({ message: "Success" })
                else 
                    res.send({message: "Error"})
            }
        )
    } else {
        res.send({ message: "You are not Khamidjon. Sorry!" })
    }
});

app.get("/someone/projects", function (req, res) {
    Project.find(function (err, myData) {
        handleRes(err, myData, res)
    });
})

app.get("/someone/skills", function (req, res) {
    Skill.find(function (err, myData) {
        handleRes(err, myData, res)
    });
})
// ------------------------------------------------------------------------------------------------------

let port = process.env.PORT;
if(port==null || port==""){
    port = 9000;
}

app.listen(port, function () {
    console.log("Server started listening on port");
});
