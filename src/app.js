
import express from 'express';
import bodyParser from 'body-parser';
import mountRoutes from './routes'
import cors from 'cors';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';


const app = express();

const session = {
  secret: "LoxodontaElephasMammuthusPalaeoloxodonPrimelephas",
  cookie: {},
  resave: false,
  saveUninitialized: false
};

if (app.get("env") === "production") {
  session.cookie.secure = true; // Serve secure cookies, requires HTTPS
}

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || "http://localhost:3000/callback"
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API 
     * (resource server)
     * accessToken is the token to call the Auth0 API 
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile);
  }
);

app.use(expressSession(session));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

const whitelist = ['http://localhost:3000']
const corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
}

/**
* Middleware
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/", authRouter);

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://thrones.auth0.com/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: 'Ho2KUMFOJDO2a9EKW7hqrmKqdl0lt053',
    issuer: `https://thrones.auth0.com/`,
    algorithms: ['RS256']
});

// catch 400
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(400).send(`Error: ${res.originUrl} not found`);
    next();
});

// catch 500
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send(`Error: ${err}`);
    next();
});

/**
* Register the routes
*/
mountRoutes(app)

export default app;