import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";

interface FetchOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

const useFetch = (baseUrl: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (endpoint: string, options: FetchOptions) => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = AsyncStorage.getItem("accessToken");
        const url = `${baseUrl}${endpoint}`;
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        };

        const response = await fetch(url, {
          method: options.method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLoading(false);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        setLoading(false);
        throw err;
      }
    },
    [baseUrl]
  );

  const get = useCallback(
    (endpoint: string) => fetchData(endpoint, { method: "GET" }),
    [fetchData]
  );

  const post = useCallback(
    (endpoint: string, body: any) =>
      fetchData(endpoint, { method: "POST", body }),
    [fetchData]
  );

  const put = useCallback(
    (endpoint: string, body: any) =>
      fetchData(endpoint, { method: "PUT", body }),
    [fetchData]
  );

  const del = useCallback(
    (endpoint: string) => fetchData(endpoint, { method: "DELETE" }),
    [fetchData]
  );

  return { get, post, put, del, loading, error };
};

export default useFetch;
