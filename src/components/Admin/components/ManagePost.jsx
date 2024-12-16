import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  getAllPostsInactive,
  getDetailPostById,
  banPost,
  unbanPost,
  inactivePost,
  activePost,
} from "@/fetchData/Post";
// import { getAllReport } from "@/fetchData/Report";
import AdminPagination from "./AdminPagination";
import toast from "react-hot-toast";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";

const ManagePostAdmin = () => {
  const [action, setAction] = useState("");
  const [note, setNote] = useState("");
  const [posts, setposts] = useState([]);
  // const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPostDetail, setcurrentPostDetail] = useState(null);
  const [currentPostId, setcurrentPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const postsPerPage = 10;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const [filteredposts, setFilteredposts] = useState([]);
  const currentposts = filteredposts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredposts.length / postsPerPage);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  if (currentPostDetail) console.log("currentPostDetail: ", currentPostDetail);
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getAllPostsInactive(searchTerm);
      setTimeout(() => {
        if (response.data.errCode === 0) {
          const sortedData = response.data.data.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setposts(sortedData);
          setFilteredposts(sortedData);
        } else {
          setError("Error fetching data. Please try again later.");
          setposts([]);
        }
        setLoading(false); // Dừng loading sau 3 giây
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setError("Error fetching data. Please try again later.");
        setposts([]);
        setLoading(false);
      }, 1000); // Thời gian chờ là 3 giây
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search]);

  const fetchPostDetails = async () => {
    if (currentPostId !== null) {
      try {
        setLoading(true);
        const response = await getDetailPostById(currentPostId);
        setcurrentPostDetail(response.data.data);
      } catch (error) {
        setError("Error fetching post details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    fetchPostDetails();
  }, [currentPostId]);

  // useEffect(() => {
  //   // Fetch reports from API
  //   const fetchReports = async () => {
  //     try {
  //       const response = await getAllReport();
  //       if (response.data.errorCode === 0) {
  //         setReports(response.data.data);
  //       } else {
  //         console.error(response.data.errMessage);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching reports:", error);
  //     }
  //   };

  //   fetchReports();
  // }, []);

  // // Function to check if a post should be banned based on reports
  // const checkAndBanPost = (postId) => {
  //   // Filter reports for the postId and count those with isAdminChecked: 1
  //   const filteredReports = reports.filter(
  //     (report) => report.postId === postId && report.isAdminChecked === 1
  //   );

  //   // If there are 10 reports with isAdminChecked: 1, ban the post
  //   if (filteredReports.length >= 10) {
  //     // Assuming you want to ban the post without any note, you can modify as needed
  //     banPost(postId, "Automatically banned due to 10 admin-checked reports.")
  //       .then((response) => {
  //         console.log("Post banned successfully:", response);
  //         // Optionally update the post's status locally
  //       })
  //       .catch((error) => {
  //         console.error("Error banning post:", error);
  //       });
  //   }
  // };

  // // Example: Check all posts and automatically ban if necessary
  // useEffect(() => {
  //   // Assuming `posts` state holds the list of posts you want to check
  //   posts.forEach((post) => {
  //     checkAndBanPost(post.id);
  //   });
  // }, [reports, posts]); // This effect runs when either reports or posts change

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    let filtered;
    if (status.toUpperCase() === "ALL".toUpperCase()) {
      filtered = posts;
    } else {
      filtered = posts.filter(
        (Post) => Post.statusCode.toUpperCase() === status.toUpperCase()
      );
    }
    setFilteredposts(filtered);
  };

  const handleSearchInputChange = (e) => setSearchTerm(e.target.value);

  const handleOpenUpdateModal = (id) => {
    setcurrentPostId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSearch = () => {
    setSearch(searchTerm);
    fetchPosts(search);
  };
  const handleInactive = async (note) => {
    try {
      setLoading(false);
      const res = await inactivePost(currentPostDetail.id, note);
      console.log("res.data: ", res.data.errCode);
      if (res.data.errCode === 0) {
        toast.success("Bài viết đã bị từ chối!");
        fetchPosts();
        fetchPostDetails();
        setShowConfirm(false);
        setModalOpen(false);
      } else {
        toast.error("Có lỗi xảy ra:", res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleActive = async () => {
    try {
      setLoading(true);
      const res = await activePost(currentPostDetail.id);
      console.log("res.data: ", res.data.errCode);
      if (res.data.errCode === 0) {
        toast.success("Bài viết đã approve thành công!");
        fetchPosts();
        fetchPostDetails();
        setShowConfirm(false);
        setModalOpen(false);
      } else {
        toast.error("Có lỗi xảy ra:", res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleUnban = async (note) => {
    try {
      setLoading(true);
      const res = await unbanPost(
        currentPostDetail.id,
        note,
        currentPostDetail.userId
      );
      console.log("res.data: ", res.data.errCode);
      if (res.data.errCode === 0) {
        toast.success("Bài viết đã được mở khóa!");
        fetchPosts();
        fetchPostDetails();
        setShowConfirm(false);
        setModalOpen(false);
      } else {
        toast.error("Có lỗi xảy ra:", res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleBan = async (note) => {
    try {
      setLoading(true);
      const res = await banPost(currentPostDetail.id, note);
      console.log("res.data: ", res.data.errCode);
      if (res.data.errCode === 0) {
        fetchPosts();
        fetchPostDetails();
        toast.success("Bài viết đã bị cấm thành công!");
        setShowConfirm(false);
        setModalOpen(false);
      } else {
        toast.error("Có lỗi xảy ra:", res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <GlobalLoadingMain isSubmiting={true} />;

  if (error) return <p>{error}</p>;

  return (
    <div className="border border-blue-gray-100 shadow-sm rounded-lg">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-grow">
            <Input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              type="text"
              placeholder="Search by Post name..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon sx={{ color: "gray" }} />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="p-3 text-white bg-third hover:bg-primary rounded-md"
          >
            Search
          </Button>
        </div>
        <div className="relative w-full flex justify-end pr-2 sm:pr-4 mt-2 sm:mt-4">
          <select
            id="typeFilter"
            className="p-1 sm:p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition duration-200"
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            {" "}
            <option value="ALL">All Status</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="BANNED">BANNED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>
      <Table className="table-auto w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">STT</TableHead>
            <TableHead className="text-center">Post Name</TableHead>
            <TableHead className="text-center">Mail User</TableHead>
            <TableHead className="text-center">Phone User</TableHead>
            <TableHead className="text-center">Is Hot</TableHead>
            <TableHead className="text-center">Status Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentposts.map((post, index) => (
            <TableRow
              key={post.id}
              onClick={() => handleOpenUpdateModal(post.id)}
              className="cursor-pointer hover:bg-slate-300"
            >
              <TableCell className="text-center">
                {indexOfFirstPost + index + 1}
              </TableCell>
              <TableCell className="text-center">
                {post.postDetailData.name}
              </TableCell>
              <TableCell className="text-center">
                {post.userPostData.email}
              </TableCell>
              <TableCell className="text-center">
                {post.userPostData.phoneNumber}
              </TableCell>
              <TableCell className="text-center">
                {post.isHot === 1 ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`w-20 text-center inline-block py-1 px-2 rounded-full text-xs ${post.statusCode.toUpperCase() === "APPROVED"
                    ? "bg-green-500 text-white"
                    : post.statusCode.toUpperCase() === "PENDING"
                      ? "bg-gray-500 text-white"
                      : post.statusCode.toUpperCase() === "BANNED"
                        ? "bg-orange-500 text-white"
                        : post.statusCode.toUpperCase() === "CLOSED"
                          ? "bg-orange-800 text-white"
                          : "bg-red-500 text-white"
                    }`}
                >
                  {post.statusCode.toUpperCase() === "APPROVED"
                    ? "APPROVED"
                    : post.statusCode.toUpperCase() === "PENDING"
                      ? "PENDING"
                      : post.statusCode.toUpperCase() === "BANNED"
                        ? "BANNED"
                        : post.statusCode.toUpperCase() === "CLOSED"
                          ? "CLOSED"
                          : "REJECTED"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage} // Update currentPage when page changes
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Dialog for view detail Post */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          {currentPostDetail && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {currentPostDetail.postDetailData.name}
                </DialogTitle>
              </DialogHeader>
              <div className="border-t border-gray-200 mt-4">
                <dl>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Skill Requirement
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.skillRequirement}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.description}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Amount
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.amount}
                    </dd>
                  </div>

                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Job Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.jobTypePostData.value}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Work Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.workTypePostData.value}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Salary
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {
                        currentPostDetail.postDetailData.salaryTypePostData
                          .value
                      }
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Job Level
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.jobLevelPostData.value}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Experience
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.expTypePostData.value}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Gender
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.genderPostData.value}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Province
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.postDetailData.provincePostData.value}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Time Post
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {String(currentPostDetail.timePost).split(" ")[0]}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Time End
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {String(currentPostDetail.timeEnd).split(" ")[0]}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Note</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPostDetail.note}
                    </dd>
                  </div>
                  <div className="pt-6">
                    <div className="flex justify-end">
                      {currentPostDetail.statusCode.toUpperCase() ===
                        "PENDING".toUpperCase() && (
                          <>
                            <button
                              onClick={handleActive}
                              className="p-3 text-white bg-green-500 hover:bg-green-700 rounded-md mr-2"
                            >
                              Approve
                            </button>
                            <GlobalLoadingMain isSubmiting={loading} />
                            <button
                              onClick={() => {
                                setShowConfirm(true);
                                setAction("reject");
                              }}
                              className="p-3 text-white bg-red-500 hover:bg-red-700 rounded-md"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      {currentPostDetail.statusCode.toUpperCase() ===
                        "APPROVED".toUpperCase() && (
                          <>
                            <button
                              onClick={() => {
                                setShowConfirm(true);
                                setAction("reject");
                              }}
                              className="p-3 text-white bg-red-500 hover:bg-red-700 rounded-md mr-2"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setShowConfirm(true);
                                setAction("ban");
                              }}
                              className="p-3 text-white bg-orange-500 hover:bg-orange-700 rounded-md"
                            >
                              Ban
                            </button>
                          </>
                        )}
                      {currentPostDetail.statusCode.toUpperCase() ===
                        "REJECTED".toUpperCase() && (
                          <button
                            onClick={handleActive}
                            className="p-3 text-white bg-green-500 hover:bg-green-700 rounded-md"
                          >
                            Approve
                          </button>
                        )}

                      {currentPostDetail.statusCode.toUpperCase() ===
                        "BANNED".toUpperCase() && (
                          <button
                            onClick={() => {
                              setShowConfirm(true);
                              setAction("unban");
                            }}
                            className="p-3 text-white bg-blue-500 hover:bg-blue-700 rounded-md"
                          >
                            Unban
                          </button>
                        )}
                    </div>

                    {showConfirm === true && (
                      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Confirm Action</DialogTitle>
                          </DialogHeader>
                          <DialogDescription>
                            Are you sure {action}?
                          </DialogDescription>
                          <h3 className="text-xl font-normal text-gray-500 mt-5 mb-6">
                            Warning: This action cannot be undone.
                          </h3>
                          <div className="mt-4">
                            <label
                              htmlFor="banReason"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Reason for {action}:
                            </label>
                            <Input
                              id="banReason"
                              type="text"
                              className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Enter the reason for banning this user"
                            />
                          </div>
                          <div className="flex justify-center mt-4">
                            <button
                              onClick={() => {
                                if (
                                  action.toUpperCase() === "ban".toUpperCase()
                                ) {
                                  handleBan(note);
                                }
                                if (
                                  action.toUpperCase() === "unban".toUpperCase()
                                ) {
                                  handleUnban(note);
                                }
                                if (
                                  action.toUpperCase() ===
                                  "reject".toUpperCase()
                                ) {
                                  handleInactive(note);
                                }
                                setNote("");
                              }}
                              className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
                            >
                              Yes, I am sure
                            </button>
                            <GlobalLoadingMain isSubmiting={loading} />
                            <button
                              onClick={() => setShowConfirm(false)}
                              className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
                            >
                              No, cancel
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </dl>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagePostAdmin;
