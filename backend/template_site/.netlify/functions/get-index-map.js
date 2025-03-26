export async function handler(event, context) {
  const indexMap = process.env.SECRET_INDEX_MAP;

  if (!indexMap) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "SECRET_INDEX_MAP not found" })
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: indexMap
  };
}
