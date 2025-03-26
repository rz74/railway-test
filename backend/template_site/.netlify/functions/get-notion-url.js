export async function handler(event, context) {
    const url = process.env.NOTION_PAGE_URL;
  
    if (!url) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "NOTION_PAGE_URL not found" })
      };
    }
  
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store"
      },
      body: url
    };
  }
  