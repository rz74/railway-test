import fs from "fs";
import path from "path";

export async function handler(event, context) {
  try {
    const filePath = path.join(process.cwd(), "secrets", "target.txt");

    const url = fs.readFileSync(filePath, "utf8").trim();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store"
      },
      body: url
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not load target URL" })
    };
  }
}
