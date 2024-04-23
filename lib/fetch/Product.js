import axios from "axios";



export const createProduct = async (data) => {
  console.log("Create Fn run")
  await axios
    .post("/api/admins/branch", data)
    .then((response) => {
      console.log("data", response.data); // Handle response data
      // if (response.status >= 200 || response.status < 300) {
      //   console.log("Creating Branch Success. refetching branch data.")
      //   queryClient.invalidateQueries("branchData");
      // }

      return response.data;
    })
    .catch((error) => {
      console.error("Error posting data:", error);
    });
};
export const updateProduct = async (data) => {
  console.log("Update Fn run")
  await axios
    .patch("/api/admins/branch", data)
    .then((response) => {
      console.log("data", response.data); // Handle response data
      // if (response.status >= 200 || response.status < 300) {
      //   console.log("Creating Branch Success. refetching branch data.")
      //   queryClient.invalidateQueries("branchData");
      // }

      return response.data;
    })
    .catch((error) => {
      console.error("Error posting data:", error);
    });
};


export const getProduct = async (branch, page=0, limit="10", search="") => {
  try {
    if (!branch) {
      console.log("Error");
      return;
    }

    console.log("Fetching products");

    const res = await axios.get(`/api/admins/branch/products?branch=${branch}&page=${page}&limit=${limit}&search=${search}`);
    console.log(res.data.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching admin data:", error.message);
    throw error;
  }
};
