const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cors());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/resumeDB", {useNewUrlParser: true, useUnifiedTopology: true});

// ---------------------------------- schemas ----------------------------------
const isUpdatedSchema = {
    isUpdate: Number
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
    pictureLink: String
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
    if(!err){
        res.send(myData)
    } else {
        res.status(404).send({
            message: "Error"
        })
    }
}

app.get("/someone/shouldupdate", function(req, res){
    IsUpdate.find(function(err, myData){
        handleRes(err, myData, res)
    });
})

app.get("/someone/aboutme", function(req, res){
    AboutMeSchema.find(function(err, myData){
        handleRes(err, myData, res)
    });
})

app.get("/someone/honors", function(req, res){
    Honor.find(function(err, myData){
        handleRes(err, myData, res)
    });
})

app.get("/someone/posts", function(req, res){
    Post.find(function(err, myData){
        handleRes(err, myData, res)
    });
})

app.get("/someone/projects", function(req, res){
    Project.find(function(err, myData){
        handleRes(err, myData, res)
    });
})

app.get("/someone/skills", function(req, res){
    Skill.find(function(err, myData){
        handleRes(err, myData, res)
    });
})
// ------------------------------------------------------------------------------------------------------

app.listen(9000, function(){
    console.log("Server started listening on port 3000");
});