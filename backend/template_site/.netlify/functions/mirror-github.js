export async function handler(event, context) {
    const url = process.env.PROXY_TARGET;
  
    if (!url) {
      return {
        statusCode: 500,
        body: "Missing PROXY_TARGET environment variable"
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
  