// get the client

//const mysql = require('mysql2');
const mysql = require('mysql2/promise');

// connection.query(
//   "SELECT * FROM link",
//   function(err, results, fields) {
//     console.log(results); // results contains rows returned by server
//     //console.log(fields); // fields contains extra meta data about results, if available
//   }
// );


function db () {
  this.connection =  mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'shortLink',
    password: 'root'
  });
}

db.prototype.query = async function(sql) {
    this.connection.execute(sql,'',function(err,rows){
      console.log(sql,err,rows)
      return new Promise(function(resolve,reject){
        err ? reject(err) : resolve(rows)
      })
    });
}

const DB = new db()

module.exports = DB