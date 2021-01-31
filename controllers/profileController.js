const User = require('../models/User');
const Post = require('../models/Post')
const moment = require('moment');
const axios = require('axios');
const { validationResult } = require('express-validator');

// exports.getProfile =  (req, res, next) => {
//   let name
//   let bio
//   let Image
//       if(req.user){
//          name = req.user.name
//          bio = req.user.bio
//          Image = req.user.Image
//       }else{
//          name = null
//          bio = null
//          Image = null
//       }
//       res.render('profile/profile',{
//       name: name,
//       bio: bio,
//       Image:Image
//       })
// }


exports.getUsersProfile = async (req, res, next) => {
  
  const userId = req.params.id
  let userRepos = [];

  try{
    const userDoc = await User.findOne({_id : userId})
    const posts = await Post.find({ user: userId }).sort({ createdAt: "desc" })
    .populate("user");

    // fetch first five repose from user's github account to show them in projects section
    if(userDoc.websites.length > 0) { 
      let userGithubUrl = userDoc.websites[0];
      const lastIndexOfBackSlash = userGithubUrl.lastIndexOf('/');
      // substract username after the last backslash and to the last index of the string
      const githubUsername = userGithubUrl.substring(lastIndexOfBackSlash + 1, userGithubUrl[-1])
      const response = await axios.get(`https://api.github.com/users/${githubUsername}/repos`)
      const repos = response.data;

      repos.forEach((repo, index) => {
        // if userRepose less than 5 objects and the repo is not forked (created by the user himself) => push it into array
        if (repo.fork !== true && userRepos.length < 5) {
          userRepos.push({ repoName: repo.name, repoUrl: repo.html_url })
        }
      })
    }
    console.log(userRepos);

    res.render('profile/user-profile',{
    user : userDoc,
    userId: userId,
    posts,
    moment,
    userRepos
      })
    }
    catch(e){
      console.log(e)
    }
}
 
exports.getUpdateProfile =  (req, res, next) =>{
 
  let userid = req.user._id || null;

  let websites = req.user.websites;

  let websitesObj = {};
// convert the array of websites to object of all websites
  for (const link of websites) {

    if (link.includes("github")) {
      websitesObj["github"] = link;
    } else if (link.includes("instagram")) {
      websitesObj["instagram"] = link;
    } else if (link.includes("twitter")) {
      websitesObj["twitter"] = link;
    } else if  (link.includes("stackoverflow")) {
      websitesObj["stackoverflow"] = link;
    } else if (link.includes("linkedin")) {
      websitesObj["linkedin"] = link;
    }

  }
  // console.log(websitesObj, '75')

  res.render('profile/edit-profile',
  {
    userid : userid,
    websitesObj,
    errorMassage:null
  })
}
exports.postUpdateProfile = async(req, res, next) =>{
  console.log(req.body)
  const userid = req.body.userid
  const name = req.body.name
  const bio = req.body.bio
  const country = req.body.country
  const YOB = req.body.date_of_birth
  const gender = req.body.gender
  const skills = req.body.skills
  const nativeLang = req.body.nativeLang
  const github = req.body.github;
  const linkedin = req.body.linkedin;
  const instagram = req.body.instagram;
  const twitter = req.body.twitter;
  const stackoverflow = req.body.stackoverflow;

  let image;
  let Image;
  image = req.file

  if(image !== undefined){
       Image= image.path
  }

//!Validaton block ===============================
let websites = req.user.websites;
 let websitesObj = {};
// convert the array of websites to object of all websites
  for (const link of websites) {

    if (link.includes("github")) {
      websitesObj["github"] = link;
    } else if (link.includes("instagram")) {
      websitesObj["instagram"] = link;
    } else if (link.includes("twitter")) {
      websitesObj["twitter"] = link;
    } else if  (link.includes("stackoverflow")) {
      websitesObj["stackoverflow"] = link;
    } else if (link.includes("linkedin")) {
      websitesObj["linkedin"] = link;
    }
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('profile/edit-profile', {
      errorMassage: errors.array()[0].msg,
      userid : userid,
      websitesObj
    });
  }
//! ============================================

  try{
  const user = await User.findOne({_id : userid})
     user.name = name
     user.bio = bio
     user.country = country
     user.yearOfBirth = YOB
     user.gender = gender
     if(skills !== undefined){
     user.skills = skills
     }
     user.nativeLang = nativeLang

    //  console.log(image)
     if(image !== undefined){
       user.Image = Image
     }
     // !if github url is provided it will always be first element in my array that's why im checking it there in my profile controller above
     let websites = [github, linkedin, stackoverflow, twitter, instagram];

     if (github === '' || linkedin === '' || stackoverflow === '' || twitter === '' || instagram === '') {
       // pop them from the websites array
       websites = websites.filter(link => link !== '');
     }
     
     user.websites = websites;
     user.save()
     res.redirect('/users/profile/' + userid)
  }
  catch(e) {
    console.log(e)
  }
}

