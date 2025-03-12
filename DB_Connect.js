const { Pool } = require('pg');
require('dotenv').config()

// const pool = new Pool({
// user: '***REMOVED***',
// host: '***REMOVED***',
// database: '***REMOVED***',
// password: '***REMOVED***',
// port: 5432,
// });

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT
})

async function getResultTable() {
    pool.connect();
    let table;
    await pool.query('SELECT * FROM dijkstra_result', (err,res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(res.rows);
        table = res.rows;
    })

    return table;
}

// Create route
async function getRoute(startName, startLat, startLon, endName, endLat, endLon) {
    startId = await queryLocationId(startName, startLat, startLon);
	console.log("startId: " + startId);
    endId = await queryLocationId(endName, endLat, endLon);
	console.log("endId: " + startId);

    routeTable = await queryRoute(startId, endId);
	console.log(routeTable);

	return routeTable.rows;
}

// Find source location for given address, lat and lon
async function queryLocationId(name, lat, lon) {
	// Looks at bounding box of every road and searches to see if lat and lon are bounded within it
    query = 'SELECT source FROM ways WHERE ((x1 < '+ lat +' AND x2 >'+ lat + ') OR (x2 < '+ lat +' AND x1 > ' + lat + ')) AND ((y1 < '+ lon +' AND y2 > '+ lon +') OR (y2 <' + lon + ' AND y1 > ' + lon + '))';

    var table = await queryDatabase(query);
	console.log("Location Table for: " + name);
	console.log(table);

    if (table.rows.length > 0) {
        return table.rows[0].source; // Return first location listed
    } else {
        return -1; // Query returned empty
    }
}

// Find Route
async function queryRoute(startId, endId) {
	console.log("query route at: " + startId + ", " + endId);
    query = 'SELECT * FROM pgr_dijkstra(\' SELECT gid AS id, source, target, length AS cost FROM ways\',' + startId + ',' + endId + ', directed := false) INNER JOIN ways ON node = ways.source ORDER BY seq';
	var routeTable = await queryDatabase(query);
	return routeTable;
}

async function queryDatabase(query) {
	console.log("queryDatabase: " + query);
    try {
		const result = await usePooledConnectionAsync(async connection =>{
			const table = await new Promise((resolve, reject) => {
				connection.query(query, (ex, rows) =>{
					if (ex) {
						reject(ex);
					} else {
						resolve(rows);
					}
				});
			});
			return table;
		});
		
		return result;
    } catch (err) {
        return err.stack;
    }
}

// Taken from
// https://stackoverflow.com/questions/18496540/node-js-mysql-connection-pooling
async function usePooledConnectionAsync(actionAsync) {
	const connection = await new Promise((resolve, reject) => {
	  pool.connect((ex, connection) => {
		if (ex) {
		  reject(ex);
		} else {
		  resolve(connection);
		}
	  });
	});
	try {
	  return await actionAsync(connection);
	} finally {
	  connection.release();
	}
}

module.exports = { getRoute };