export default async <T>(path: string, body: object): Promise<T> => {
  const result = await fetch(path, {
    body: JSON.stringify(body),
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    method: "POST",
    mode: "cors",
  });
  return result.json();
};
