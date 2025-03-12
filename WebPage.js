const JSONGen = require('./JSON_Generator');
// Webpage set-up
const express = require("express");
const app = express();
const http = require('http');
const port = 3000;



app.use(express.json());
app.listen(port, () => {
    console.log("Example app listening at http://***REMOVED***:" + port);
})

// Used as a general default route to do testing
app.get("/default_test", async (req,res) => {
    try {
        const JSONFile = await JSONGen.getJSONFile(
            "Walmsley Road",
            -1.5733895000,
            53.8121758000,
            "Kingston Terrace",
            -1.552916,
            53.809503
        );

        res.send(JSONFile)
    } catch (err) {
        console.log(err);
    }
});

// General queries on route
app.get("/route", async (req,res) => {
    try {
        const response = await JSONGen.getJSONFile(
            req.query.sname,
            req.query.slat,
            req.query.slon,
            req.query.ename,
            req.query.elat,
            req.query.elon
        )

        res.send(response);
    } catch (err) {
        let JSON = {};
        JSON.code = err;
        console.log("error: " + err);
        
        res.send(JSON);
    }
})
