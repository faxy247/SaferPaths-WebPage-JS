const db = require('./DB_Connect');

// Get roads in bounding box
async function getHeatMap(xl, xr, yb, yt) {
	heatMap = await queryBoundingBox(xl, xr, yb, yt);

	return heatMap;
}

// Get list of roads within bounding box
async function queryBoundingBox(xl, xr, yb, yt) {
	// finds where roads have endpoints within bounding box
	query = 'SELECT * FROM PathRoutes WHERE (x1 > ' + xl + ' AND x1 < ' + xr + ' AND y1 > ' + yb + ' AND y1 < ' + yt + ') OR (x2 > ' + xl + ' AND x2 < ' + xr + ' AND y2 > ' + yb + ' AND y2 < ' + yt + ')';

	var table = await db.queryDatabase(query);
	console.log("Query Bounding Box Table");
	console.log(table);

	if (table.rows.length > 0) {
        return table.rows; // Return first location listed
    } else {
        return -1; // Query returned empty
    }
}

module.exports = { getHeatMap }