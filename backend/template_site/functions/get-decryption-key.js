import fs from "fs";

export async function handler() {
  try {
    const key = fs.readFileSync("secrets/key.txt", "utf8").trim();
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
      body: key
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not read key" })
    };
  }
}
