import axios from "./axios";
const token = localStorage.getItem("token");
const getAllCompanies = (searchKey) => {
  return axios.get(`/getAllCompaniesInactive?searchKey=${searchKey}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const getAllCompaniesInHomePage = () => {
  return axios.get("/getAllCompanies");
};
const getAllCompaniesUser = (searchKey) => {
  return axios.get(`/getAllCompanies?searchKey=${searchKey}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const getCompanyById = (companyId) => {
  return axios.get(`/getCompanyById?id=${companyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const banCompany = (companyId, reason) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/banCompany`,
    {
      companyId: companyId,
      reason: reason,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const unbanCompany = (companyId) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/unBanCompany`,
    {
      companyId: companyId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const updateCompany = (
  companyId,
  name,
  address,
  description,
  phonenumber,
  amountEmployer,
  coverimage,
  thumbnail,
  file,
  taxnumber,
  typeCompany,
  website
) => {
  return axios.post(
    `/updateCompany`,
    {
      companyId: companyId,
      name: name,
      address: address,
      description: description,
      phonenumber: phonenumber,
      amountEmployer: amountEmployer,
      coverimage: coverimage,
      thumbnail: thumbnail,
      file: file,
      taxnumber: taxnumber,
      typeCompany: typeCompany,
      website: website,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const inactiveCompany = (companyId) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/rejectCompany`,
    {
      companyId: companyId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const activeCompany = (companyId) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `/approveCompany`,
    {
      companyId: companyId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const createNewCompany = (data) => {
  return axios.post(`/createNewCompany`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const exchangePointToView = (data) => {
  return axios.post(`/exchangePointToView`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const exchangePointToPost = (data) => {
  return axios.post(`/exchangePointToPost`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export {
  getAllCompanies,
  getCompanyById,
  banCompany,
  inactiveCompany,
  activeCompany,
  unbanCompany,
  getAllCompaniesUser,
  updateCompany,
  createNewCompany,
  getAllCompaniesInHomePage,
  exchangePointToView,
  exchangePointToPost
};
