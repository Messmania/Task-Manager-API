/** Starting point of the app */
const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
require('./db/mongoose'); //--to connect to db we need to execute this file, order doesn't matter w.r.t User and Task import.

const app = express();
const PORT = process.env.PORT;

app.use(express.json());//---to parse request body as json
app.use(userRouter);
app.use(taskRouter);

app.listen(PORT, () => {
    console.log("Server is up at port:", PORT);
});