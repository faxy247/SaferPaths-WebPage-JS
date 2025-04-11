const db = require('./DB_Connect');

// Create route
async function getRoute(startName, startLat, startLon, endName, endLat, endLon, alg) {
    startId = await queryLocationId(startName, startLat, startLon);
    endId = await queryLocationId(endName, endLat, endLon);

    routeTable = await queryRoute(startId, endId, alg);

	return routeTable.rows;
}

// Find source location for given address, lat and lon
async function queryLocationId(name, lat, lon) {
	// Looks at bounding box of every road and searches to see if lat and lon are bounded within it
    query = 'SELECT source FROM ways ORDER BY the_geom <-> ST_GeometryFromText(\'POINT(' + lat + ' ' + lon +')\',4326) LIMIT 1';

    var table = await db.queryDatabase(query);
    if (table.rows.length > 0) {
        return table.rows[0].source; // Return first location listed
    } else {
        return -1; // Query returned empty
    }
}

// Find Route
async function queryRoute(startId, endId, alg) {
    var query = '';
    switch(alg){
        case 1: // aStar no Heuristic
            query = 'SELECT * FROM pgr_bdAstar(\'SELECT gid AS id, source, target, cost, cost, x1, y1, x2, y2 FROM pathroutes\',' + startId + ',' + endId + ',directed => false,heuristic => 0) INNER JOIN PathRoutes ON node = Pathroutes.source ORDER BY seq';
            break;
        case 2: // Dijkstra
            query = 'SELECT * FROM pgr_bdDijkstra(\' SELECT gid AS id, source, target, cost AS cost FROM PathRoutes\',' + startId + ',' + endId + ', directed := false) INNER JOIN PathRoutes ON node = Pathroutes.source ORDER BY seq';
            break;
        default: // aStar with Heuristic being pythagorean distance
            query = 'SELECT * FROM pgr_bdAstar(\'SELECT gid AS id, source, target, cost, cost, x1, y1, x2, y2 FROM pathroutes\',' + startId + ',' + endId + ',directed => false,heuristic => 4) INNER JOIN PathRoutes ON node = Pathroutes.source ORDER BY seq';
    }
    

	var routeTable = await db.queryDatabase(query);
	return routeTable;
}

module.exports = { getRoute };