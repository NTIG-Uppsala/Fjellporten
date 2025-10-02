import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Create __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse POST form data
app.use(express.urlencoded({ extended: true }));

// Serve static files 
app.use('/admin', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Middleware to protect /admin
function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// Login page
app.get('/admin/login', (req, res) => {
    res.render('login', { error: '', username: '', focus: 'username' });
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

// Handle login form
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Fel användarnamn eller lösenord.', username: username, focus: 'password' });
    }
});

// Logout route
app.get('/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});

// **Protected admin page**
app.get('/admin', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server körs på http://localhost:${PORT}`));