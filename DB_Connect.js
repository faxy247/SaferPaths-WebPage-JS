const { Pool } = require('pg');
require('dotenv').config()

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

module.exports = { queryDatabase };