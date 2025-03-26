export async function handler(event, context) {
    const map = process.env.OBFUSCATION_MAP;
  
    if (!map) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OBFUSCATION_MAP not set" })
      };
    }
  
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: map
    };
  }
  