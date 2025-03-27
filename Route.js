const db = require('./DB_Connect');

// Create route
async function getRoute(startName, startLat, startLon, endName, endLat, endLon) {
    startId = await queryLocationId(startName, startLat, startLon);
    endId = await queryLocationId(endName, endLat, endLon);

    routeTable = await queryRoute(startId, endId);
	console.log("Route Table made.");
	console.log(routeTable.rows);

	return routeTable.rows;
}

// Find source location for given address, lat and lon
async function queryLocationId(name, lat, lon) {
	// Looks at bounding box of every road and searches to see if lat and lon are bounded within it
    query = 'SELECT source FROM ways WHERE ((x1 < '+ lat +' AND x2 >'+ lat + ') OR (x2 < '+ lat +' AND x1 > ' + lat + ')) AND ((y1 < '+ lon +' AND y2 > '+ lon +') OR (y2 <' + lon + ' AND y1 > ' + lon + '))';

    var table = await db.queryDatabase(query);
	console.log("Location Table for " + name + " made.");
	//console.log(table.rows);

    if (table.rows.length > 0) {
        return table.rows[0].source; // Return first location listed
    } else {
        return -1; // Query returned empty
    }
}

// Find Route
async function queryRoute(startId, endId) {
	console.log("query route at: " + startId + ", " + endId);
    query = 'SELECT * FROM pgr_bdDijkstra(\' SELECT gid AS id, source, target, cost AS cost FROM PathRoutes\',' + startId + ',' + endId + ', directed := false) INNER JOIN ways ON node = ways.source ORDER BY seq';
	var routeTable = await db.queryDatabase(query);
	return routeTable;
}

module.exports = { getRoute };