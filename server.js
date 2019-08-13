import app from './app';
import "@babel/polyfill";

const port = process.env.PORT || '4000'; app.listen(port); 

console.log(`Listening on port ${port}`);