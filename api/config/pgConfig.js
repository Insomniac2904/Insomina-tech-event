const { Client } = require("pg");
const client = new Client(process.env.connectionUrl);
module.exports = client;
