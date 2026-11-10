const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  const { rows } = await pool.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name"
  );
  console.log("Tables:", rows.map((r) => r.table_name));
  await pool.end();
}

migrate().catch((e) => {
  console.error(e.message);
  process.exit(1);
});