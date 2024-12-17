import axios from "./axios";
const token = localStorage.getItem("token");
const getAllPostsInactive = (searchKey) => {
  return axios.get(`/getAllPost?searchKey=${searchKey}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getAllPostWithLimit = (limit, offset) => {
  return axios.get(`getAllPostWithLimit?limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getAllPost = () => {
  return axios.get(`/getAllPost`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const createNewPost = (data) => {
  return axios.post(`/createNewPost`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getDetailPostById = (id) => {
  return axios.get(`getDetailPostById?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const banPost = (id, note) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/banPost`,
    {
      id: id,

      note: note,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const unbanPost = (id, note, userId) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/unBanPost`,
    {
      id: id,
      note: note,
      userId: userId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const inactivePost = (id, note) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/rejectPost`,
    {
      id: id,

      note: note,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const activePost = (id) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/approvePost`,
    {
      id: id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const handleClosePost = (id) => {
  return axios.post(
    `/closePost`,
    {
      id: id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export {
  getDetailPostById,
  banPost,
  unbanPost,
  activePost,
  inactivePost,
  getAllPostsInactive,
  getAllPostWithLimit,
  getAllPost,
  createNewPost,
  handleClosePost,
};
