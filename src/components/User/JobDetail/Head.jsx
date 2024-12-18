import { Button } from "../../ui/button";
import StickyBanner from "./StickyBanner";
import Countdown from "./Countdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  AccessTimeRounded,
  CategoryRounded,
  EmojiEventsRounded,
  ExploreRounded,
  GroupsRounded,
  OpenInNewRounded,
  PaidRounded,
  PeopleAltRounded,
  ScheduleSendRounded,
  WorkHistoryRounded,
} from "@mui/icons-material";
import Card from "../Homepage/Common/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "../../../fetchData/axios";
import { useEffect, useState } from "react";
import { RiFileUserFill } from "react-icons/ri";
import { FaPenFancy } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { getCvByUserId, handleApplyJob } from "../../../fetchData/CvPost";
import { MdOutlineDoubleArrow } from "react-icons/md";
import toast from "react-hot-toast";

import Report from "./Report";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";

import { Image } from "@nextui-org/react";

import { getAllPost } from "@/fetchData/Post";
import GlobalLoadingSmall from "@/components/GlobalLoading/GlobalLoadingSmall";

const Head = ({ job }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fromPage, prevLocation } = location.state || {};
  const userId = localStorage.getItem("user_id");
  const [user, setUser] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [cvData, setCvData] = useState();
  const [isApplied, setIsApplied] = useState(false);
  const jobId = job.data.id;
  const deadline = new Date(job.data.timeEnd).getTime();
  const currentTime = new Date();
  const [isSubmitting, setIsSubmitting] = useState(false); // State for loading
  const [relatedJob, setRelatedJob] = useState([]); // State for
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchUserData();
    console.log("job ne", job);
    fetchRelatedJobs();
  }, [userId, jobId]);
  const handleBackClick = () => {
    if (prevLocation) {
      navigate(prevLocation, { state: { page: fromPage } });
    } else {
      navigate("/jobs");
    }
  };

  if (!job) {
    return <p>Loading...</p>;
  }
  if (currentTime > deadline) {
    console.log("Thời gian đã hết hạn");
  } else {
    console.log("Thời gian vẫn còn");
  }

  const fetchUserData = async () => {
    // const jobId = job.data.id;
    setLoading(true);
    try {
      const response = await axios.get(`/getUserById?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const cvResponse = await axios.get(`getAllListCvByPost?postId=${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("verify chua", cvResponse);
      if (response.status === 200 && cvResponse.status === 200) {
        setUser(response.data.data);
        console.log("verify roi", response.data.data);
        setCvData(cvResponse.data.count);
        if (Array.isArray(cvResponse.data.data)) {
          let userApplied = false;
          for (let cv of cvResponse.data.data) {
            if (cv.userId == userId) {
              userApplied = true;
              setIsApplied(userApplied);
              break;
            }
          }
          // setIsApplied(userApplied);
          console.log("userApplied", userApplied);
        } else {
          console.error("Khong phai mang");
        }
      } else {
        console.log("loi roi", cvResponse);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const applyJobSubmit = async () => {
    setIsSubmitting(true); // Set loading to true
    try {
      const response = await handleApplyJob(userId, jobId, description);
      if (response.data.errCode === 0) {
        setIsOpen(false);
        toast.success(response.data.errMessage);
        fetchUserData();
      } else {
        console.log(response);
        toast.error(response.data.errMessage);
      }
    } catch (error) {
      console.error("Error applying job:", error);
    } finally {
      setIsSubmitting(false); // Set loading to false
    }
  };

  const handleApplyStatus = () => {
    const deadline = new Date(job.data.timeEnd).getTime();

    if (user?.isVerify === 0) {
      toast.error("You have to verify your email to apply jobs!");
    } else if (deadline <= Date.now()) {
      toast.error("Apply CV time has been expired!");
    } else {
      setIsOpen(true);
    }
  };
  const fetchRelatedJobs = async () => {
    try {
      const res = await getAllPost();
      if (res.data.errCode === 0) {
        console.log("relate ne", res.data.data);

        // Filter related jobs
        const relatedJobs = res.data.data.filter(
          (post) =>
            post.postDetailData.jobTypePostData.code ===
            job.data.postDetailData.jobTypePostData.code
        );

        // Sort by `isHot` first, then by `createdAt` (newest first)
        const sortedJobs = relatedJobs.sort((a, b) => {
          // Compare `isHot` first
          if (b.isHot !== a.isHot) {
            return b.isHot - a.isHot; // `1` (hot) comes before `0` (not hot)
          }
          // If `isHot` is the same, compare `createdAt`
          return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
        });

        // Limit to 9 jobs
        const limitedSortedJobs = sortedJobs.slice(0, 9);

        console.log(
          "related jobs (sorted by isHot, createdAt, and limited to 9):",
          limitedSortedJobs
        );
        setRelatedJob(limitedSortedJobs);
      } else {
        console.log("Error fetching related jobs");
      }
    } catch (error) {
      console.error("Error in fetchRelatedJobs:", error);
    }
  };

  return (
    <div className="flex flex-col mx-4 lg:mx-36">
      {/* button back to job list */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/jobs">Job Page</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary">
              Hire {job.data.postDetailData?.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left */}
        <div className="col-span-2">
          <div className="flex flex-col text-third bg-white shadow-lg mb-8 rounded-lg p-6">
            <div className="flex gap-2 text-2xl font-medium mb-4 lg:text-left text-center">
              <div className="border-3 border-primary"></div>
              <p className="font-semibold">
                Position: {job.data.postDetailData?.name}
              </p>
            </div>

            <div className="flex flex-wrap justify-start gap-3 flex-row md:items-center sm:items-center items-center">
              <div className="flex gap-4 items-center justify-center text-center">
                <ExploreRounded
                  sx={{ fontSize: 40 }}
                  className="text-primary"
                />

                <div className="block text-left">
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium">
                    {job.data.postDetailData?.provincePostData?.value}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-center justify-center text-center">
                <PaidRounded sx={{ fontSize: 40 }} className="text-primary" />

                <div className="block text-left">
                  <p className="text-gray-500">Salary</p>
                  <p className="font-medium">
                    {job.data.postDetailData?.salaryTypePostData?.value}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-center justify-center text-center">
                <WorkHistoryRounded
                  sx={{ fontSize: 40 }}
                  className="text-primary"
                />

                <div className="block text-left">
                  <p className="text-gray-500">Years of experience</p>
                  <p className="font-medium">
                    {job.data.postDetailData?.expTypePostData?.value}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
              <div className="flex flex-col justify-center items-center">
                <div className="flex gap-2 justify-center items-center border-2 w-fit p-1 bg-gray-200 text-sm">
                  <ScheduleSendRounded className="text-gray-600" />
                  <p>Application deadline: {job.data.timeEnd}</p>
                </div>
              </div>

              {/* nút nộp CV chỗ này */}
              <div className="flex items-center justify-center gap-x-2">
                {loading ? (
                  <GlobalLoadingSmall className="w-44" isSubmiting={loading} />
                ) : !isApplied || !userId ? (
                  <>
                    {!userId ||
                    user?.isVerify === 0 ||
                    currentTime > deadline ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
                                variant="outline"
                                className="w-fit text-white bg-primary hover:bg-primary-dark"
                                disabled
                              >
                                Apply
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="flex flex-col justify-center items-center gap-2 p-2 w-[260px]">
                            <div>
                              {!userId ? (
                                "Please login to apply for this job"
                              ) : user?.isVerify === 0 ? (
                                <>
                                  Your email is not verified. Please verify in
                                  <span className="text-primary font-semibold">
                                    {" "}
                                    User Profile
                                  </span>
                                </>
                              ) : (
                                "The application deadline has passed."
                              )}
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  !userId
                                    ? "/login"
                                    : user?.isVerify === 0
                                    ? "/userProfile/personalInfo"
                                    : "/"
                                )
                              }
                              className="mt-2 text-primary border border-primary hover:bg-primary hover:text-white"
                            >
                              {!userId
                                ? "Login Now"
                                : user?.isVerify === 0
                                ? "Verify Now"
                                : "Back to Jobs"}
                            </Button>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        className="w-fit text-white bg-primary hover:bg-primary-dark"
                        onClick={handleApplyStatus}
                      >
                        Apply
                      </Button>
                    )}

                    <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
                      <DialogContent className="text-sm">
                        <DialogHeader>
                          <DialogTitle>
                            Apply for{" "}
                            <span className="text-primary">
                              {job.data.postDetailData?.name}
                            </span>
                          </DialogTitle>

                          <div>
                            <div className="flex flex-col gap-y-4">
                              {/* CV */}
                              <div>
                                <div className="flex items-center gap-x-2 my-3 font-medium">
                                  <RiFileUserFill className="w-5 h-5" /> Your CV
                                  :
                                </div>
                                <iframe
                                  width={"100%"}
                                  height={"500px"}
                                  src={user?.UserDetailData?.file}
                                ></iframe>
                              </div>

                              {/* giới thiệu */}
                              <>
                                <div className="flex items-center gap-x-2 my-1 font-medium">
                                  <FaPenFancy className="w-5 h-5" />{" "}
                                  Introduction :
                                </div>
                                <textarea
                                  value={description}
                                  onChange={handleInputChange}
                                  placeholder="Write a brief introduction of yourself (strength, weakness) and your desire as well as your reason of choosing this job"
                                  className="w-full max-h-96 border border-gray-200 p-3 focus:border-primary"
                                />
                              </>
                            </div>
                          </div>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setIsOpen(false);
                              setDescription("");
                            }}
                            className="bg-white border border-primary text-primary hover:text-white"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={applyJobSubmit}
                            className="bg-primary border border-primary text-white hover:text-white"
                          >
                            Apply
                          </Button>
                          <GlobalLoading isSubmiting={isSubmitting} />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Button
                    className="w-full flex gap-2 py-4 mr-3 lg:w-auto px-6 text-center bg-white text-primary hover:bg-primary hover:text-white border-primary text-base font-medium"
                    variant="outline"
                    onClick={() => {
                      navigate("/userProfile/viewApplication");
                    }}
                  >
                    <MdOutlineDoubleArrow />
                    <span>View Applied Status</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* countdown */}
          <div className="my-5 bg-white rounded-md shadow-md py-5">
            <Countdown endTime={job.data.timeEnd} />
          </div>

          {/* Job Description */}
          <div className="flex flex-col bg-white p-6 rounded-lg">
            <div className="flex gap-2 h-full items-center text-third text-2xl font-medium mb-4">
              <div className="border-3 border-primary h-7"></div>
              <p className="font-semibold">Job Detail</p>
            </div>
            <div className="flex flex-col mb-2">
              <p className="text-md font-semibold">Job Description</p>
              <p className="list-item list-inside">
                {job.data.postDetailData?.description}
              </p>
              <p className="list-item list-inside">
                Wage: {job.data.postDetailData?.salaryTypePostData.value}
              </p>
            </div>

            <div className="flex flex-col mb-2">
              <p className="text-md font-semibold">Employee Requirements</p>
              <p className="list-item list-inside">
                Gender: {job.data.postDetailData?.genderPostData.value}
              </p>
              <p className="list-item list-inside">
                Years of experience:{" "}
                {job.data.postDetailData?.expTypePostData.value}
              </p>
              <div className="list-item list-inside">
                <span>Requirements:</span>
                <div
                  className="ml-8"
                  dangerouslySetInnerHTML={{
                    __html: job.data.postDetailData?.requirement,
                  }}
                />
              </div>
              <p className="list-item list-inside">
                Benefits: {job.data.postDetailData?.benefit}
              </p>
            </div>

            <div className="flex flex-col mb-2">
              <p className="text-md font-semibold">Work Location</p>
              <p className="list-item list-inside">
                {job.data.companyData?.address}
              </p>
            </div>

            <div className="flex flex-col mb-2">
              <p className="text-md font-semibold">Skill Requirement</p>
              <p className="list-item list-inside">
                {job.data.postDetailData?.skillRequirement}
              </p>
            </div>
          </div>

          {/* Related Jobs */}
          <div className="flex flex-col text-third bg-white shadow-lg mb-8 rounded-lg p-6 mt-4">
            <div className="flex gap-2 text-2xl font-medium mb-4 lg:text-left text-center">
              <div className="border-3 border-primary"></div>
              <p className="font-semibold">Related Jobs</p>
            </div>
            <div className="space-y-4">
              <Card expand="expand" data={relatedJob} />
            </div>
          </div>
        </div>

        {/* right */}
        <div className="col-span-1">
          <div className="flex flex-col text-third bg-white shadow-lg mb-8 rounded-lg p-6 space-y-4">
            <div className="flex gap-4 items-start">
              <Image
                alt="logo"
                className="object-cover rounded-lg"
                height={100}
                shadow="md"
                src={job.data?.companyData?.thumbnail}
                width={100}
              />

              <p className="font-semibold text-xl">
                {job.data.companyData?.name}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <CategoryRounded className="text-gray-500" />
                <div className="flex gap-3 items-start">
                  <p className="text-gray-500 ">Business Field:</p>
                  <p className="font-medium text-wrap">
                    {job.data.companyData?.typeCompany}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <GroupsRounded className="text-gray-500" />
                <div className="flex gap-3 items-start">
                  <p className="text-gray-500">Scale:</p>
                  <p className="font-medium text-wrap">
                    {job.data.companyData?.amountEmployer} employees
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <ExploreRounded className="text-gray-500" />
                <div className="flex gap-12 items-start">
                  <p className="text-gray-500">Address:</p>
                  <p className="font-medium text-wrap ">
                    {job.data.companyData?.address}
                  </p>
                </div>
              </div>
            </div>
            {/* Company Contact Information */}
            <div className="flex gap-2 items-center">
              <AccessTimeRounded className="text-gray-500" />
              <div className="flex gap-3 items-start">
                <p className="text-gray-500">Working Time:</p>
                <p className="font-medium text-wrap">
                  {job.data.companyData?.workingTime}
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <PeopleAltRounded className="text-gray-500" />
              <div className="flex gap-3 items-start">
                <p className="text-gray-500">Contact:</p>
                <p className="font-medium text-wrap">
                  {job.data.companyData?.contact}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-third bg-white shadow-lg mb-8 rounded-lg p-4">
            <Report data={job} />
          </div>

          {/* Sticky Banner */}
          <StickyBanner />
        </div>
      </div>
    </div>
  );
};

export default Head;
