// Database Connection Details
const database = require('./DB_Connect');
var polyline = require('polyline');

async function getJSONFile(startName, startLat, startLon, endName, endLat, endLon) {
	let JSONObject = {}; // JSON to output

	if ((startName == null && startLat == null && startLon == null)
		|| (endName == null && endLat == null && endLon == null)) {
	if ((startName == null && (startLat == null || startLon == null))
		|| (endName == null && (endLat == null || endLon == null))) {
		
		JSONObject.code = "Error";
		JSONObject.des = "Invalid inputs";
		return JSONObject;
	}

	try {
		route = await database.getRoute(startName, startLat, startLon, endName, endLat, endLon);
		console.log("route made");

		console.log(calcTotalGeom(route))
		JSONObject.geom = calcTotalGeom(route);
	
	} catch (err) {
		console.log("Error: " + err);
		JSONObject.code = "Error";
	}

	return JSONObject;
}

// finds full geometry code to send over
function calcTotalGeom(route) {
	// Record start position
	geom = [[route[0].x1, route[0].y1]]

	// Create list of coords
	for (i in route) {
		geom.push([route[i].x1, route[i].y1])
	}

	return polyline.encode(geom)
}

module.exports = { getJSONFile };
