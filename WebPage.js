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
        const startTime = performance.now();
        const response = await JSONGen.getRouteJSON(
            req.query.sname,
            req.query.slat,
            req.query.slon,
            req.query.ename,
            req.query.elat,
            req.query.elon
        )
        const endTime = performance.now();
        const time = endTime - startTime;
        console.log('Route took: ' + time + ' ms')
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
        const startTime = performance.now();
        var alg = 0;
        var route = 0;
        if (req.query.alg != null){
            alg = Number(req.query.alg);
        }
        if (req.query.route != null){
            route = Number(req.query.route);
        }

        let address = {}
        switch (route) {
            case 1:
                address.startName = "St Michael's Lane";
                address.startLat = -1.582911;
                address.startLon = 53.817015;
                address.endName = "New Station Street";
                address.endLat = -1.547932;
                address.endLon = 53.795225;
            break;
            default:
                address.startName = "Walmsley Road";
                address.startLat = -1.5733895000;
                address.startLon = 53.8121758000;
                address.endName = "Kingston Terrace";
                address.endLat = -1.552916;
                address.endLon = 53.809503;
        }
        const JSONFile = await JSONGen.getRouteJSON(
            address.startName,
            address.startLat,
            address.startLon,
            address.endName,
            address.endLat,
            address.endLon,
            alg
        );
        const endTime = performance.now();
        const time = endTime - startTime;
        console.log('Route took: ' + time + ' ms')
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

