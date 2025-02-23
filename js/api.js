//API
const apiKey = "621c701a-a3ce-418b-9cfc-741e32a5f3a9";

//Access token
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVmljQiIsImVtYWlsIjoidmljYnJvMDI0NThAc3R1ZC5ub3JvZmYubm8iLCJpYXQiOjE3Mzk5MTYyMDl9.y6nwaryTZrI20iAXVzr8BuR7RTlfQLGEwISgfUlS6EQ";

//Url path
const url = `https://v2.api.noroff.dev/blog/posts/${"vicbro"}`;

//Options for fetch request
const options = {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Noroff-API-Key": "621c701a-a3ce-418b-9cfc-741e32a5f3a9",
        "Content-Type": "application/json"
    }
};