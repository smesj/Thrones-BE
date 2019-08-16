
import express from 'express';
import bodyParser from 'body-parser';
import mountRoutes from './routes'
import cors from 'cors';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

const app = express();

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