import axios from "./axios";
const token = localStorage.getItem("token");
const handleSetDataUserDetail = (userData) => {
  return axios.post(`/setDataUserDetail`, userData, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
};

const getUsersById = (id) => {
  return axios.get(`/getUserById?id=${id}`,{
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
};
const getAllUsers = (searchKey) => {
  return axios.get(`/getAllUsers?searchKey=${searchKey}`,{
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
};
const banUser = (userId, note) => {
  const token = localStorage.getItem("token");
  return axios.post("/banUser",
    { userId: userId, 
      note: note
    },
    {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
};
const unBanUser = (userId) => {
  const token = localStorage.getItem("token");
  return axios.post("/unBanUser",
    { userId: userId
    },{
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
};
const setUserToAdmin = (userId) => {
  const token = localStorage.getItem("token");
  return axios.post("/setUserToAdmin",
    {
      userId: userId
    },{
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
};
const resetPassword = (id, oldPassword, newPassword) => {
  return axios.post(
    `/changePassword`,
    {
      userId: id,
      oldPassword: oldPassword,
      newPassword: newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    }
  );
};
const chatWithAI = (message, userId, replyHistory) => {
  return axios.post(
    "/chatWithAI",
    { message: message, userId: userId, replyHistory: replyHistory },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export { handleSetDataUserDetail, getUsersById, banUser, unBanUser, setUserToAdmin, resetPassword, getAllUsers,chatWithAI };
