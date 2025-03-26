export async function handler(event, context) {
    const key = process.env.IMAGE_DECRYPTION_KEY;
  
    if (!key) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Decryption key not found in environment variables." })
      };
    }
  
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store"
      },
      body: key
    };
  }
  