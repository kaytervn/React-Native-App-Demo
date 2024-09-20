import { remoteUrl } from "@/src/types/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";

interface FetchOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (endpoint: string, options: FetchOptions) => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const url = `${remoteUrl}${endpoint}`;
        const headers: Record<string, string> = {
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        };

        if (!(options.body instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
          method: options.method,
          headers,
          body:
            options.body instanceof FormData
              ? options.body
              : JSON.stringify(options.body),
        });

        const contentType = response.headers.get("content-type");
        const data = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          throw new Error(
            typeof data === "string" ? data : JSON.stringify(data)
          );
        }

        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createMethod =
    (method: FetchOptions["method"]) => (endpoint: string, body?: any) =>
      fetchData(endpoint, { method, body });

  return {
    get: createMethod("GET"),
    post: createMethod("POST"),
    put: createMethod("PUT"),
    del: createMethod("DELETE"),
    loading,
    error,
  };
};

export default useFetch;
