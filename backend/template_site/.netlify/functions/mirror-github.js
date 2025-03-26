import fs from "fs";

export async function handler(event, context) {
  let url;

  try {
    url = fs.readFileSync("secrets/target.txt", "utf8").trim();
  } catch (err) {
    return {
      statusCode: 500,
      body: "Missing or unreadable secrets/target.txt"
    };
  }

  try {
    const response = await fetch(url);
    const html = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html"
      },
      body: html
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error fetching target: ${err.message}`
    };
  }
}
