import fs from "fs";

export async function handler() {
  try {
    const data = fs.readFileSync("secrets/index-map.json", "utf8");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: data
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not load index map" })
    };
  }
}
