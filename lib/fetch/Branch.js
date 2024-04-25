import axios from "axios";



export const createBranch = async (data) => {
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

export const updateBranch = async (data) => {
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

export const getBranch = async (email) => {
  try {
    if (!email) {
      console.log("No branch ID");
      return;
    }

    console.log("Fetching Branch Data");

    const res = await axios.get(`/api/admins/branch?email=${email}`);
    console.log(res.data.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching admin data:", error.message);
    throw error;
  }
};



///////////// KEY And NODE

export const generateKey = async (data) => {
  console.log("generateKey Fn run")
  await axios
    .patch("/api/admins/branch/key", data)
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

export const deleteKey = async (data) => {
  console.log("delete Fn run")
  await axios
    .patch("/api/admins/branch/key/delete", data)
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