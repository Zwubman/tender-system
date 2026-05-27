const BASE_URL = "http://localhost:5000";
// the frontend helper function that send the request to the backend
export const apiFetch = async (endpoint, options = {}) => {
  // detect FormData
  const isFormData = options.body instanceof FormData;

  const response = await fetch(
    `${BASE_URL}${endpoint}`,

    {
      // 1. Put options at the top so it doesn't overwrite your headers block
      ...options,

      // 2. Explicitly set the method fallback
      method: options.method || "GET",

      // 3. Let this block have the final say on headers
      headers: {
        ...(!isFormData && {
          "Content-Type": "application/json",
        }),
        ...options.headers, // This merges your tokens safely!
      },
    },
  );

  return response;
};
