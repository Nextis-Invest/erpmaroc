import axios from "axios";

export const createBranch = (data) => {
  axios
    .post("/api/admins/branch", data)
    .then((response) => {
      console.log(response.data); // Handle response data
    })
    .catch((error) => {
      console.error("Error posting data:", error);
    });
};
