//MARK:Import all Libraries 
import bodyParser from "body-parser";
import express from "express";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import{ MongoClient, ServerApiVersion }from "mongodb";
import { getJsonData } from "./jsonReader.js";
import session from "express-session";





const __dirname = dirname(fileURLToPath(import.meta.url));
const uri = "mongodb+srv://vishalverma865:Test%40123@cluster0.spf7t6g.mongodb.net/?retryWrites=true&w=majority";
const app = express();
let port = 3000;
const date = new Date();
let items = []
let favUniversity = [];
let currentUser = "";
let universityDescription = null
const client = new MongoClient(uri);
const myDB = client.db("myDB");
const userCollection = myDB.collection("Users");
let uuid = ""

port = process.env.PORT || 3000;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port " + port);
});
expressCode()   //set all app express default values


app.use(session({
  secret: 'your-secret-key', // Replace with a random secret key
  resave: false,
  saveUninitialized: false
}));


JsonData()      // Read the JSON file

async function JsonData() {
    try {
        items = await getJsonData();
       
    } catch (error) {
      console.error('Error:', error);
    }
  }


app.get("/", (req, res) => {
    
    res.render("home")
  });
  
  app.get("/login", (req, res) => {
   
    res.render("login")
  });
  app.get("/register", (req, res) => {
   
    res.render("register")
  });
  app.get("/about", (req, res) => {
   
    res.render("about")
  });
  
  app.get("/addToCart", (req, res) => {
   
    res.render("/addToCart")
  });
  app.get("/removeToCart", (req, res) => {
   
    res.render("removeToCart")
  });

  app.get("/userIndex", (req, res) => {
    res.render("/userIndex");
  });
  
  app.get("/contact", (req, res) => {
    res.render("contact");
  });
  app.get("/resources", (req, res) => {
    res.render("resources");
  });
  app.get("/blog", (req, res) => {
    res.render("blog.ejs");
  });


  app.get("/Authcontact", requireLogin, (req, res) => {
    res.render("AuthContact");
  });
  app.get("/Authresources", requireLogin, (req, res) => {
    res.render("AuthResources");
  });
  app.get("/Authblog", requireLogin, (req, res) => {
    res.render("AuthBlog");
  });
  // app.post("/Authcontact", requireLogin,(req, res) => {
  //   res.render("AuthContact");

  // })
  // app.post("/Authresources", requireLogin,(req, res) => {
  //   res.render("AuthResources");
  // })
  // app.post("/Authblog", requireLogin, (req, res) => {
  //   res.render("AuthBlog");
  // })





















  app.post("/search", (req, res) => {
let searchReturn = [];
    let userRequest = req.body.proviceValue
    for (let index = 0; index < items.length; index++) {
      if(items[index].Province == userRequest) {
        searchReturn.push(items[index]);
      }
    }
    res.render("uniIndex.ejs",
    {name:currentUser,
     item:searchReturn,
     favUniversity:favUniversity,
     uuid:uuid
   });


  });

  

  app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error clearing session:', err);
      }
      res.redirect('/login'); // Replace '/login' with your actual login page URL
      
    });
  });






  
  app.post("/userIndex",requireLogin ,async (req, res) => {
  
    const uniName = (req.body.selectedUniversity);
    const index = req.body.selectedIndex;
    const uniWeb = items[index].Website;
    try {
      const universityDescription = await getUniversityDescription(uniName);
      res.render("universityPage.ejs", { uniName: uniName, description: universityDescription, uniWeb: uniWeb });
    } catch (error) {
      console.error('Error fetching university description:', error.message);
      res.render("universityPage.ejs", { uniName: uniName, description: null });
    }
  });
  
  
  
  app.post("/login", async (req, res) => {
    let userName = req.body.email
    let password = req.body.password
  try {
    const foundUser = await userCollection.findOne({ email: userName });
    if (foundUser) {
      if(foundUser.password == password){
        currentUser = foundUser.email;
        uuid = foundUser._id
        favUniversity = foundUser.favList;
        req.session.isLoggedIn = true;
  req.session.username = userName;
  req.session.user = userName;
        res.render("uniIndex.ejs",
         {name:currentUser,
          item:items,
          favUniversity:favUniversity,
          uuid:foundUser._id
        });
      } else {
        res.render("login",
       {status:'Email and Password not matched',
       email:userName, 
       password:password,
       newUser: false
      });
      }
    }
    else{
      res.render("login",
       {status:'User not found',
       email:userName, 
       password:password,
       newUser: false
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
    
  })
  
  
  
  app.post("/register", async (req, res) => {
    let userName = req.body.userName
    let email = req.body.email
    let password = req.body.password
    const newUser = {name:userName, email:email, password: password, favList:[]};
  try {
    const foundUser = await userCollection.findOne({ email: email });
    if (foundUser) {
      res.render("register",
       {status:'Registration failed-email already exists',
       userName:userName,
       email:email, 
       password:password,
       newUser: false
      });
        }

    else{
    await userCollection.insertOne(newUser);
    res.render("register",
       {status:'Registered Successfully',
       userName:userName,
       email:email, 
       password:password,
       newUser: true
      });
    }
  
  } catch (err) {
    console.error('Error:', err);  }
  });



  app.post("/addToCart", requireLogin , async (req, res) => {
      const query = { email: currentUser};
      if(req.body.status == true){
    const updateDocument = { $push: { favList: req.body.uName }};
    const result = await userCollection.updateOne(query, updateDocument);
    
      } 
      else if(req.body.status == false){
        const updateDocument = { $pull: { favList: req.body.uName }};
        const result = await userCollection.updateOne(query, updateDocument);
      }
    });
    app.post("/removeToCart/:name", requireLogin , async (req, res) => {
        const query = { email: currentUser};
       if(req.body.status == false){
          const updateDocument = { $pull: { favList: req.body.name }};
          const result = await userCollection.updateOne(query, updateDocument);
          res.sendStatus(200);
        }
      });

    app.get("/savedList",requireLogin , async(req, res) => {
      if(currentUser != null){
        try {
          const foundUser = await userCollection.findOne({ email: currentUser });
            let favArray = [];
             const favList= foundUser.favList;
             for (let i = 0; i < favList.length; i++) {
              for (let j = 0; j < items.length; j++) {
                if (favList[i] == items[j].Name)  {
                  favArray.push(items[j]);
                }
             }
            }
  res.render("savedList.ejs",
               {name:foundUser.name,
                item:favArray,
                favList:favList,
                uuid:foundUser._id
              });
        }
           catch (err) {
            console.error('Error:', err);
          }
        }
    });

 



  //MARK: wiki-Data
import axios from "axios";
async function getUniversityDescription(universityName) {
  const apiUrl = `https://en.wikipedia.org/w/api.php`;
  const params = {
    action: 'query',
    format: 'json',
    prop: 'extracts',
    exintro: true,
    explaintext: true,
    titles: universityName,
  };

  try {
    const response = await axios.get(apiUrl, { params });
    const pages = response.data.query.pages;
    const universityId = Object.keys(pages)[0];
    const universityInfo = pages[universityId];
    const description = universityInfo.extract;
    return description;
  } catch (error) {
    console.error('Error fetching university description:', error.message);
    return null;
  }
}
  
//MARK: Default Express-app declarations
function expressCode() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static("public"))
    app.set('view engine','ejs');
    app.set('views', path.join(__dirname, 'views'));
    }
     



    // Middleware function to check if the user is logged in
function requireLogin(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}





//     const SerpApi = require('google-search-results-nodejs');
// const search = new SerpApi.GoogleSearch("secret_api_key");

// const params = {
//   engine: "google_images",
//   google_domain: "google.com",
//   q: "university of toronto",
//   hl: "en",
//   gl: "us"
// };

// const callback = function(data) {
//   console.log(data);
// };

// // Show result as JSON
// search.json(params, callback);