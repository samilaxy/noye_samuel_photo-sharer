const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require("helmet");
const session = require('express-session');
const flash = require('express-flash');
const conflash = require('connect-flash');
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
const { ensureAuthenticated } = require('./config/auth')
const cors = require('cors')

//import database
const {
    pool
} = require('./config/configDB');

//passport config
require('./config/passportConfig');


//start express
const app = express();

app.use(cors())


//express session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,

}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session())

//connect flash
app.use(flash())

//global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next();
});

//express.json middlewares
app.search(express.json());

//bodyparser
app.use(express.urlencoded({ extended: false }));


// view engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');


//static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/vendor', express.static(__dirname + 'public/vendor'));





// Index routes
app.use('/', require('./routes/index'));

//users routes
app.use('/users', require('./routes/users'));

//main routes
app.use('/main', require('./routes/main'));

//main routes
app.use('/admin', require('./routes/admin'));






//picture upvote page route
app.post('/picpage/like/:id', (req, res) => {

    // get id
    const id = req.params.id

    console.log(req.params.id)
    console.log(id)

    // fetch pictre likes by the id
    pool.query(`SELECT up FROM picture WHERE id = $1`, [id], (err, result) => {
        if (err) {
            console.log(err.message)
        }
        //console.log(result.rows)

        const vote = result.rows[0].up
        console.log(result.rows[0].up)
        pool.query(`UPDATE picture SET up = $1 WHERE id = $2`, [vote + 1, id], (err, result) => {
            if (err) {
                console.log(err.message)
            }

            // res.render('picpage', {
            //     name: req.user.name,
            //     title: result.rows[0].title,
            //     description: result.rows[0].description,
            //     img: result.rows[0].img
            // })
        });

    });
})

//download picture route
app.get('/download', ensureAuthenticated, (req, res) => {
    // res.send('checking')
    const id = req.query.id

    console.log(req.params.id)
    console.log(id)
        // check if email is already in the system
    pool.query(`SELECT * FROM picture WHERE id = $1`, [id], (err, result) => {
        if (err) {
            console.log(err.message)
        }
        console.log(result.rows)
            //res.json(result.rows)
        const picture = result.rows
        let file = picture.img[0]
        file = `${__dirname}/${file.url}`
        console.log(file)
        res.download(file)

    });

});



//start server
app.listen(8000, () => {
    console.log('Server is listening on Port 8000')
})