var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSession = require("express-session"),
    User = require("./models/user"),
    methodOverride = require("method-override"),
    Software = require("./models/softwareCompany"),
    Analytics = require("./models/analyticsCompany"),
    Post = require("./models/post"),
    ejs = require("ejs");
const { static } = require("express");

var app = express();

mongoose.connect("mongodb+srv://subha123:subha123@cluster0.ya74d.mongodb.net/Interview-Prep",{
    useNewUrlParser : true , useUnifiedTopology : true
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use("/public", express.static("public"));

// PASSPORT CONFIGURATION
app.use(expressSession({
    secret : "I live in Jamshedpur",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register(new User({username : req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            // req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            // req.flash("success","Welcome To Yelp Camp " + user.username);
            res.redirect("/");
        });
    });
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect : "/",
    failureRedirect : "login"
}), function(req, res){});

app.get("/software", function(req, res){
    Software.find({}, function(err, company){
        if(err){
            console.log(err);
        }
        else{
            res.render("software/softwares", {data : company});
        }
    });
});

app.get("/analytics", function(req, res){
    Analytics.find({}, function(err, company){
        if(err){
            console.log(err);
        }
        else{
            res.render("analytics/analytics", {data : company});
        }
    });
});

app.get("/analytics/new", function(req, res){
    res.render("analytics/new");
});

app.post("/analytics", function(req, res){
    var newCompany = req.body.company;
    Analytics.create(newCompany, function(err, company){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("analytics");
        }
    });
});

app.get("/software/new", function(req, res){
    res.render("software/new");
});

app.post("/software", function(req, res){
    var newCompany = req.body.company;
    Software.create(newCompany, function(err, company){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("software");
        }
    });
});

app.get("/software/:id", function(req, res){
    Software.findById(req.params.id).populate("posts").exec(function(err, foundCompany){
        if(err){
            console.log(err);
        }
        else{
            // console.log(foundCompany);
            res.render("software/show",{company : foundCompany});
        }
    });
});

app.get("/analytics/:id", function(req, res){
    Analytics.findById(req.params.id).populate("posts").exec(function(err, foundCompany){
        if(err){
            console.log(err);
        }
        else{
            // console.log(foundCompany);
            res.render("analytics/show",{company : foundCompany});
        }
    });
});

app.get("/software/:id/posts/new", isLoggedIn, function(req, res){
    Software.findById(req.params.id, function(err, foundCompany){
        if(err)
        console.log(err);
        else
        res.render("posts/softwareNew", {company : foundCompany});
    });
});

app.post("/software/:id/posts", isLoggedIn, function(req, res){
    Software.findById(req.params.id, function(err, company){
        if(err){
            res.redirect("software"+req.params.id);
        }
        else{
            Post.create(req.body.post, function(err, post){
                if(err){
                    console.log(err);
                }
                else{
                    post.author.id = req.user._id;
                    post.author.username = req.user.username;
                    post.save();
                    company.posts.push(post);
                    company.save();
                    res.redirect("/software/"+req.params.id);
                }
            });
        }
    });
});

app.get("/software/:id/posts/:post_id/edit", checkForPostOwnership, function(req, res){
    Post.findById(req.params.post_id, function(err, foundPost){
        if(err){
            res.redirect("back");
        }
        else{
            res.render("software/edit", {company_id:req.params.id, post : foundPost});
        }
    });
});

app.put("/software/:id/posts/:post_id", checkForPostOwnership, function(req, res){
    Post.findByIdAndUpdate(req.params.post_id, req.body.post,function(err, updatePost){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/software/"+req.params.id);
        }
    });
});

app.delete("/software/:id/posts/:post_id", checkForPostOwnership, function(req, res){
    Post.findByIdAndDelete(req.params.post_id, function(err){
        if(err){
            res.redirect("/software/"+req.params.id);
        }
        else{
            res.redirect("/software/"+req.params.id);
        }
    });
});

app.get("/analytics/:id/posts/new", isLoggedIn, function(req, res){
    Analytics.findById(req.params.id, function(err, foundCompany){
        if(err)
        console.log(err);
        else
        res.render("posts/analyticsNew", {company : foundCompany});
    });
});

app.post("/analytics/:id/posts", isLoggedIn, function(req, res){
    Analytics.findById(req.params.id, function(err, company){
        if(err){
            res.redirect("analytics"+req.params.id);
        }
        else{
            Post.create(req.body.post, function(err, post){
                if(err){
                    console.log(err);
                }
                else{
                    post.author.id = req.user._id;
                    post.author.username = req.user.username;
                    post.save();
                    company.posts.push(post);
                    company.save();
                    res.redirect("/analytics/"+req.params.id);
                }
            });
        }
    });
});

app.get("/analytics/:id/posts/:post_id/edit", checkForPostOwnership, function(req, res){
    Post.findById(req.params.post_id, function(err, foundPost){
        if(err){
            res.redirect("back");
        }
        else{
            res.render("analytics/edit", {company_id:req.params.id, post : foundPost});
        }
    });
});

app.put("/analytics/:id/posts/:post_id", checkForPostOwnership, function(req, res){
    Post.findByIdAndUpdate(req.params.post_id, req.body.post,function(err, updatePost){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/analytics/"+req.params.id);
        }
    });
});

app.delete("/analytics/:id/posts/:post_id", checkForPostOwnership, function(req, res){
    Post.findByIdAndDelete(req.params.post_id, function(err){
        if(err){
            res.redirect("/analytics/"+req.params.id);
        }
        else{
            res.redirect("/analytics/"+req.params.id);
        }
    });
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/login");
    }
}

function checkForPostOwnership(req, res, next){
    if(req.isAuthenticated){
        Post.findById(req.params.post_id, function(err, foundPost){
            if(err){
                console.log(err);
                res.redirect("back");
            }
            else{
                if(foundPost.author.id.equals(req.user._id))
                next();

                else{
                    res.redirect("back");
                }
            }
        });
    }
    else{
        res.redirect("back");
    }
}
// var PORT = process.env.PORT || 3000;
// app.listen(PORT, function(){
//     console.log(`Server has started at ${PORT}`);
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}


app.listen(port, function(){
    console.log("Server has started");
});