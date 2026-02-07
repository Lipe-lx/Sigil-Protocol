const isDevelopment = process.env.NODE_ENV === 'development';
const PRODUCTION_URL = 'https://sigil-protocol.lulipe-lx.workers.dev';
const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/graphql` 
  : isDevelopment ? 'http://localhost:3001/graphql' : `${PRODUCTION_URL}/graphql`;

export async function fetchGraphQL<T>(query: string, variables: any = {}): Promise<T> {
  if (!GRAPHQL_URL) {
    console.warn('GraphQL endpoint not configured. Skipping fetch.');
    return {} as T;
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map((e: any) => e.message).join(', '));
  }

  return result.data as T;
}
