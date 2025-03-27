// Database Connection Details
const RouteGen = require('./Route');
const HeatMapGen = require('./HeatMap')
var polyline = require('polyline');

async function getRouteJSON(startName, startLat, startLon, endName, endLat, endLon) {
	let JSONObject = {}; // JSON to output

	if ((startName == null && (startLat == null || startLon == null))
		|| (endName == null && (endLat == null || endLon == null))) {
		
		JSONObject.code = "Invalid inputs";
		return JSONObject;
	}

	// Using lat and lon only, we require start and end name to be empty strings
	if (startName == null) {startName = ""};
	if (endName == null) {endName = ""};

	try {
		route = await RouteGen.getRoute(startName, startLat, startLon, endName, endLat, endLon);
		console.log("route made");

		console.log(calcTotalGeom(route))
		JSONObject.geom = calcTotalGeom(route);
		JSONObject.code = "Ok";
	
	} catch (err) {
		console.log("Error: " + err);
		JSONObject.code = "Error";
	}

	return JSONObject;
}

// finds full geometry code to send over
function calcTotalGeom(route) {
	// Record start position
	geom = [[route[0].y1, route[0].x1]]

	// Create list of coords
	for (i in route) {
		geom.push([route[i].y1, route[i].x1])
	}

	return polyline.encode(geom)
}

async function getHeatMapJSON(lonl, lonr, latb, latt) {
	let JSONObject = {};

	if (lonl == null || lonr == null || latb == null || latt == null) {
		JSONObject.code = "Invalid inputs";
		return JSONObject;
	}

	try {
		heatMap = await HeatMapGen.getHeatMap(lonl, lonr, latb, latt);
		console.log("heatMap");
		console.log(heatMap);

		roads = getRoadObjects(heatMap);
		console.log("getRoadObject completed");

		JSONObject.roads = roads;
		JSONObject.code = "ok";
		
	} catch (err) {
		console.log("Error: " + err);
		JSONObject.code = "Error"
	}

	return JSONObject;
}

// Returns list of road geometries and cost metrics
function getRoadObjects(roadTable) {
	var roads = [{}];

	for (i in roadTable) {
		road = {};
		road.geom = polyline.encode([
			[roadTable[i].y1, roadTable[i].x1],
			[roadTable[i].y2, roadTable[i].x2]
		]);
		road.cost = roadTable[i].total;
		roads[i] = road;
	}

	return roads;
}

module.exports = { getRouteJSON, getHeatMapJSON };
