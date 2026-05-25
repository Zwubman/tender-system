const BASE_URL = "http://localhost:5000";
// the frontend helper function that send the request to the backend
export const apiFetch = async (
   endpoint,
   options = {}
) => {

   // detect FormData
   const isFormData =
      options.body instanceof FormData;

   const response = await fetch(
      `${BASE_URL}${endpoint}`,

      {
         method: "GET",

         headers: {

            // only add JSON header
            // if body is NOT FormData

            ...( !isFormData && {
               "Content-Type":
                  "application/json",
            }),

            ...options.headers,
         },

         ...options,
      }
   );

   return response;
};