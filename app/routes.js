const Favorite = require('./models/favorite');
const User = require('./models/user');
//Multer Puts objects/files on HD
// line 3 Req param => users, pass, DataBAse, npm Multer, objId (line12 server.js)= ??
module.exports = function(app, passport, db, multer, ObjectId) {

// Image Upload Code =========================================================================
// Make a Var for the storing of imgs => multer.(multer Method?)
var storage = multer.diskStorage({

    destination: (req, file, cb) => {    //What is cb? ... Maybe filepath
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")  // cb filepath and timestamp with date and filetype
    }
});
var upload = multer({storage: storage}); //upload img to destination 'storage'

// normal routes ===============================================================

// show the home page (will also have our login links)
app.get('/', function(req, res) {
    res.render('index.ejs');
});
app.get('/recipes', function(req, res) {
        res.render('recipe.ejs');
});
app.get('/submit', function(req, res) {
    res.render('submit.ejs');
});
app.get('/blog', function(req, res) {
    res.render('blog.ejs');
});
app.get('/faq', function(req, res) {
    res.render('faq.ejs');
});
app.get('/dose', function(req, res) {
    res.render('dosage_calc.ejs');
});
app.get('/terpene', function(req, res) {
    res.render('terpene.ejs');
});
app.get('/infusion', function(req, res) {
    res.render('infusion.ejs');
});


// PROFILE SECTION =========================
app.get('/profile', isLoggedIn, function(req, res) {
    let uId = ObjectId(req.session.passport.user)   //uId = unique id from passport
    db.collection('posts').find({'posterId': uId}).toArray((err, result) => {   //posterId is uId
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user : req.user,  //key-value pairs
        posts: result   //post = result from DB
      })
    })
});

// FEED PAGE =========================
app.get('/feed', function(req, res) {
    db.collection('posts').find().toArray((err, result) => {  //Find all posts then turn to array
      if (err) return console.log(err)
      res.render('feed.ejs', {   //render /feed
        user : req.user,
        posts: result
      })
    })
});

// INDIVIDUAL POST PAGE =========================
app.get('/post/:zebra', function(req, res) {  //  /:zebra = query param
    let postId = ObjectId(req.params.zebra)   // postId = the queryParam unique number
    console.log(postId);
    db.collection('posts').find({_id: postId}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('post.ejs', {
        posts: result
      })
    })
});

//Create Post =========================================================================
app.post('/qpPost', upload.single('file-to-upload'), (req, res, next) => {  //one picture to post   //next????
  let uId = ObjectId(req.session.passport.user) // uId === the individual
  db.collection('posts').save({posterId: uId, caption: req.body.caption, likes: 0, imgPath: 'images/uploads/' + req.file.filename, description: req.body.description, ingredients: req.body.ingredients}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
});
app.post('/favorite', function(req, res){
  let likerId = ObjectId(req.session.passport.user)
  let postId = ObjectId(req.body.postId)
  let favorite = Favorite.create({likerId: likerId, postId: postId})
  favorite.save();
})
// Delete==============================================================================

app.delete('/posts', isLoggedIn, (req, res) => {
  let uId = ObjectId(req.session.passport.user)

  // let postId = ObjectId(req.params.id)
  db.collection('posts').findOneAndDelete({_id: ObjectId(req.body._id), posterId: uId}, (err, result) => {
    console.log(req.body._id)
    console.log(ObjectId(req.body._id))
    if (err) return res.send(500, err)
    if(result.value === null){
      res.send(404, "not found mike pennisi")
      return
    }
    res.send('Message deleted!')
  })
})

//Update ===============================================================

app.put('/posts', (req, res) => {
  db.collection('posts')
  .findOneAndUpdate({_id: ObjectId(req.body._id)}, {
    $inc: {
      likes: 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})


// // Feed Update *********************************************
//
// app.put('/feed', (req, res) => {
//   db.collection('posts')
//   .findOneAndUpdate({_id: ObjectId(req.body._id)}, {
//     $inc: {
//       likes: 1
//     }
//   }, {
//     sort: {_id: -1},
//     upsert: true
//   }, (err, result) => {
//     if (err) return res.send(err)
//     res.send(result)
//   })
// })


// LOGOUT ==============================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');  //back to root index
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });  //flash-->login/ signup message
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;  // Can we add functionality to delete the users posts?
        user.local.email    = undefined;  //  delete email + password
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {   //Next???
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

//------questions to ask-----------------

//What is cb? lines 9,12
//What is next? line 62 && 130
//Explain lines 7-16
//How can we change the users prof pic
//No put requests --delete, like...
//Do we need a comment section (new collection) -extra functionality
//
//

//-------extra functionality?-----------
//comment section => plus new collection
//delete user posts upon unlink
//add videos/ gifs
//
//
