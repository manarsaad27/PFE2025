import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mon_pfe",
  waitForConnections: true,
  connectionLimit: 1000,
  queueLimit: 0,
});


pool.getConnection((err, connection) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
  } else {
    console.log("Connexion à la base de données réussie !");
    connection.release(); 
  }
});

export default pool.promise();