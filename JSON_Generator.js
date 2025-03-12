// Database Connection Details
const RouteGen = require('./Route');
const HeatMapGen = require('./HeatMap')
var polyline = require('polyline');

async function getRouteJSON(startName, startLat, startLon, endName, endLat, endLon, alg = 0) {
	let JSONObject = {}; // JSON to output
	//JSONObject.routes = [{}];
	//JSONObject.routes.legs = [{}];

	if ((startName == null && (startLat == null || startLon == null))
		|| (endName == null && (endLat == null || endLon == null))) {
		
		JSONObject.code = "Invalid inputs";
		return JSONObject;
	}

	// Using lat and lon only, we require start and end name to be empty strings
	if (startName == null) {startName = ""};
	if (endName == null) {endName = ""};

	try {
		route = await RouteGen.getRoute(startName, startLat, startLon, endName, endLat, endLon, alg);
		console.log("route made");

		//JSONObject.routes.legs.steps = calcSteps(route);
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
		JSONObject.code = "Ok";
		
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

function calcSteps(route) {
	let steps = [{}];
	let i = 0;
	let tmpStepObj = {};
	for (step in route) {
		// Each step represents a change in direction at a junction on the route.
		// The data given by pgRouting is between the nodes of the map.
		// Hence, some nodes may need to be combined as the represent a single step in the JSON file.

		if (step.name != tmpStepObj.name){
			if (i != 0) {
				// Calculate turning direction from previous step location and this step location
				bearingAtChange = bearing(step) - tmpStepObj.maneuver.bearing_after;
				if (bearingAtChange < 180) {
					tmpStepObj.maneuver.modifier = "right";
				}
				else {
					tmpStepObj.maneuver.modifier = "left";
				}

				// Add previous step to list and reset
				JSONObject.routes.legs.steps.push(tmpStepObj);
				tmpStepObj = {};
			}

			// New Step created
			tmpStepObj.name = step.name;
			tmpStepObj.distance = step.cost;
			tmpStepObj.duration = step.cost_s;

			// Location always taken from first point in sequence for Maneuver
			tmpStepObj.maneuver.location = [step.x1, step.y1];
			// Find bearing of first segment of maneuver
			tmpStepObj.maneuver.bearing_before = bearing(step);
			tmpStepObj.maneuver.bearing_after = bearing(step);

			if (i == route.length()) {
				// final move
				tmpStepObj.maneuver.type = "arrive";
			}
			else if (i>0) {
				tmpStepObj.maneuver.type = "turn";
			}
			else {
				// first move
				tmpStepObj.maneuver.type = "depart";
			}
		}
		else {
			// More information for Step
			tmpStepObj.distance += step.cost;
			tmpStepObj.duration += step.cost_s;
			tmpStepObj.maneuver.bearing_after = bearing(step);
		}

		i++;
	}

	return steps;
}

// Taken from
// https://stackoverflow.com/questions/46590154/calculate-bearing-between-2-points-with-javascript
function bearing(step){
	startLat = toRadians(step.y1);
	startLng = toRadians(step.x1);
	destLat = toRadians(step.y2);
	destLng = toRadians(step.x2);
  
	y = Math.sin(destLng - startLng) * Math.cos(destLat);
	x = Math.cos(startLat) * Math.sin(destLat) -
		  Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
	brng = Math.atan2(y, x);
	brng = toDegrees(brng);
	return (brng + 360) % 360;
  }

function toRadians(degrees) {
	return degrees + Math.PI / 180;
}

function toDegrees(radians) {
	return radians * 180 / Math.PI;
}

module.exports = { getRouteJSON, getHeatMapJSON };
