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

// General queries on route
app.get("/route", async (req,res) => {
    try {
        const response = await JSONGen.getRouteJSON(
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

// Used as a general default route to do testing
app.get("/route/default", async (req,res) => {
    console.log("Default Route");
    try {
        var alg = 0;
        if (req.query.alg != null){
            alg = Number(req.query.alg);
        }
        const JSONFile = await JSONGen.getRouteJSON(
            "Walmsley Road",
            -1.5733895000,
            53.8121758000,
            "Kingston Terrace",
            -1.552916,
            53.809503,
            alg
        );
        

        res.send(JSONFile)
    } catch (err) {
        console.log(err);
    }
});

// Default heatmap for testing
app.get("/heatmap/default", async(req,res) => {
    console.log("Default HeatMap");
    try {
        const JSONFile = await JSONGen.getHeatMapJSON(
            -1.580293,
            -1.566131,
            53.809236,
            53.814658
        )

        res.send(JSONFile)
    } catch (err) {
        let JSON = {};
        JSON.code = err;
        console.log("error: " + err);
        
        res.send(JSON);
    }
})

// heatmap for testing
app.get("/heatmap", async(req,res) => {
    console.log("HeatMap");
    try {
        const JSONFile = await JSONGen.getHeatMapJSON(
            req.query.lonl,
            req.query.lonr,
            req.query.latb,
            req.query.latt,
        )

        res.send(JSONFile)
    } catch (err) {
        let JSON = {};
        JSON.code = err;
        console.log("error: " + err);
        
        res.send(JSON);
    }
})

