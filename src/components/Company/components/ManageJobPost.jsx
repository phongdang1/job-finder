import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "../../../fetchData/axios";
import { Badge } from "@/components/ui/badge";
import {
  handleApproveCvPost,
  handleCreateInterviewSchedule,
  handleRejectCvPost,
} from "@/fetchData/CvPost";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Avatar } from "@mui/material";
import defaultAvatar from "../../../assets/images/avatar_ne.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { handleClosePost } from "@/fetchData/Post";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";
const ManageJobPost = () => {
  const [company, setCompany] = useState([]);
  const [post, setPost] = useState([]);
  const [userCVs, setUserCVs] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [schedule, setSchedule] = useState({});
  const [openSchedule, setOpenSchedule] = useState(null);
  const currentYear = new Date().getFullYear();
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: "",
    interviewLocation: "",
    interviewNote: "",
    cvPostId: "",
    companyId: "",
  });
  const [rejectDialog, setRejectDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setScheduleForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const companyId = JSON.parse(localStorage.getItem("companyId"));
  const date = new Date();
  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/getCompanyById?id=${companyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.errCode === 0) {
        setCompany(res.data.data);
        console.log("company ne", res.data.data);
        setPost(res.data.data.postData);
      } else {
        console.log("Error: ", res.data.errMessage);
      }
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };
  const fetchUserCvs = async () => {
    const userCvData = {};
    const userDetailsData = {};
    const scheduleData = {};

    setIsLoading(true);

    try {
      // Gửi tất cả các yêu cầu CV cùng lúc
      const userCVRequests = post.map((cvEntry) => {
        const id = cvEntry.id;
        console.log(`Fetching CVs for post ID: ${id}`);
        return axios
          .get(`/getAllListCvByPost?postId=${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((res) => {
            userCvData[id] = res.data.data || [];
            return res.data.data || [];
          });
      });

      const userCVs = await Promise.all(userCVRequests);

      const userDetailsRequests = [];
      const scheduleRequests = [];

      userCVs.forEach((cvList, postId) => {
        cvList.forEach((userCv) => {
          const userId = userCv.userId;
          if (!userDetailsData[userId]) {
            userDetailsRequests.push(
              axios
                .get(`/getUserById?id=${userId}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                })
                .then((resUserDetail) => {
                  userDetailsData[userId] = resUserDetail.data.data;
                })
            );

            scheduleRequests.push(
              axios
                .get(`/getInterviewScheduleByCvPost?cvPostId=${userCv.id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                })
                .then((resSchedule) => {
                  scheduleData[userCv.id] = resSchedule.data.data;
                })
            );
          }
        });
      });

      await Promise.all([...userDetailsRequests, ...scheduleRequests]);

      setUserCVs(userCvData);
      setUserDetails(userDetailsData);
      setSchedule(scheduleData);

      console.log("Final User CVs by Post ID:", userCvData);
      console.log("Final User Details:", userDetailsData);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching user CVs:", error);
    }
  };

  const handleSubmitForm = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `/createInterviewSchedule`,
        {
          interviewDate: scheduleForm.interviewDate,
          interviewLocation: scheduleForm.interviewLocation,
          interviewNote: scheduleForm.interviewNote,
          cvPostId: scheduleForm.cvPostId,
          companyId: scheduleForm.companyId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.errCode === 0) {
        console.log("form ne", res);
        setOpenSchedule(null);
        toast.success("Set interview schedule successfully !!!");
        await fetchUserCvs();
        setScheduleForm({
          interviewDate: "",
          interviewLocation: "",
          interviewNote: "",
          cvPostId: "",
          companyId: "",
        });
      } else {
        toast.error(res.data.errMessage);
        console.log("loi roi", res);
      }
    } catch (error) {
      console.log("error j j day", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id) => {
    setIsLoading(true);

    try {
      const res = await handleRejectCvPost(id);
      if (res.data.errCode === 0) {
        console.log("CV Rejected !!!", res);
        toast.success("CV Rejected !!");

        setRejectDialog(false);
        setScheduleForm({
          interviewDate: "",
          interviewLocation: "",
          interviewNote: "",
          cvPostId: "",
          companyId: "",
        });

        await fetchUserCvs();
      } else {
        console.log("Error rejecting CV");
      }
    } catch (error) {
      console.log("Error rejecting CV:", error);
    } finally {
      setIsLoading(false); // Tắt loading khi tất cả hoàn tất
    }
  };
  const handleApprove = async (id) => {
    setIsLoading(true);
    try {
      const res = await handleApproveCvPost(id);
      if (res.data.errCode === 0) {
        console.log("CV Approved!!!", res);
        toast.success("CV Approved");
        setApproveDialog(false);
        await fetchUserCvs();
      } else {
        console.log("loi approved", res);
      }
    } catch (error) {
      console.log("error approve", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  useEffect(() => {
    if (post.length > 0) {
      fetchUserCvs(post);
    }
  }, [post]);

  const closePost = async (id) => {
    try {
      const res = await handleClosePost(id);
      if (res.data.errCode === 0) {
        toast.success(res.data.errMessage);
        setCloseDialog(false);
        fetchCompanyData();
      } else {
        console.log("loi closed", res);
      }
    } catch (error) {
      console.log("error close", error);
    }
  };
  const handleUpdateTime = (value, type) => {
    if (!scheduleForm.interviewDate) {
      toast.error("Please pick a date first!");
      return;
    }

    // Tạo một đối tượng Date từ interviewDate
    const date = new Date(scheduleForm.interviewDate);

    // Cộng giờ hoặc phút tùy thuộc vào type
    if (type === "hour") {
      date.setHours(value); // Cập nhật giờ
    } else if (type === "minute") {
      date.setMinutes(value); // Cập nhật phút
    }

    // Chuyển datetime thành chuỗi định dạng và cập nhật lại vào scheduleForm
    const updatedDateTime = format(date, "yyyy-MM-dd HH:mm:ss");

    setScheduleForm({
      ...scheduleForm,
      interviewDate: updatedDateTime, // Cập nhật interviewDate
    });
  };

  return (
    <div className="mt-8 my-60">
      <GlobalLoadingMain isSubmiting={isLoading} />

      <h1 className="text-3xl font-semibold my-4">
        Total Post ({post.length})
      </h1>
      <Tabs defaultValue="post" className="w-full">
        <TabsList>
          <TabsTrigger
            className="data-[state=active]:bg-primary/50 data-[state=active]:text-white transition-colors"
            value="post"
          >
            Post
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-primary/50 data-[state=active]:text-white transition-colors"
            value="closed"
          >
            Closed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="post">
          {/* table post */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {post.map(
                (post) =>
                  post.statusCode !== "CLOSED" && (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium w-1/6 xl:w-2/5 max-w-40 xl:max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {post.postDetailData.name}
                      </TableCell>
                      <TableCell className="w-2/5 max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {post.postDetailData.description}
                      </TableCell>
                      <TableCell className="w-2/5 max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {post.postDetailData.skillRequirement}
                      </TableCell>
                      <TableCell className="text-right flex items-end justify-center">
                        {/* mở cái dialog user ne */}
                        <Dialog>
                          <DialogTrigger>
                            <div className="flex items-center px-4 py-2 text-primary bg-white hover:bg-primary hover:text-white border border-primary rounded font-semibold">
                              <AiOutlineEye className="w-5 h-5 mr-2" />
                              View CV
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[1500px] h-3/4 overflow-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {post.postDetailData.name}
                              </DialogTitle>
                              <DialogDescription>
                                User CV Details for this post.
                              </DialogDescription>
                            </DialogHeader>
                            {/* table CV pending */}
                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <AccordionTrigger>PENDING</AccordionTrigger>
                                <AccordionContent>
                                  {/* table pending */}
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>

                                        <TableHead>Status</TableHead>
                                        <TableHead>Percentage Match</TableHead>
                                        <TableHead className="text-left">
                                          Description
                                        </TableHead>
                                        <TableHead>CV</TableHead>
                                        <TableHead>Action</TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {userCVs[post.id]?.some(
                                        (userCv) =>
                                          userCv.statusCode === "PENDING"
                                      ) ? (
                                        userCVs[post.id].map((userCv, index) =>
                                          userCv.statusCode === "PENDING" ? (
                                            <TableRow key={index}>
                                              <TableCell className="font-medium">
                                                {userDetails[userCv.userId]
                                                  ?.image ? (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={
                                                      userDetails[userCv.userId]
                                                        ?.image
                                                    }
                                                  />
                                                ) : (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={defaultAvatar}
                                                  />
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.firstName
                                                }{" "}
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.lastName
                                                }
                                              </TableCell>
                                              <TableCell>
                                                <span
                                                  className={`
                px-2 py-1 rounded font-semibold
                ${
                  userCv.statusCode === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : ""
                }
                ${
                  userCv.statusCode === "INACTIVE"
                    ? "bg-yellow-100 text-yellow-700"
                    : ""
                }
                ${
                  userCv.statusCode === "REJECTED" ||
                  userCv.statusCode === "BANNED"
                    ? "bg-red-100 text-red-700"
                    : ""
                }
                ${
                  userCv.statusCode === "PENDING"
                    ? "bg-slate-200 text-black"
                    : ""
                }
              `}
                                                >
                                                  {userCv.statusCode}
                                                </span>
                                              </TableCell>
                                              <TableCell>
                                                <span
                                                  className={`
                ${parseInt(userCv.file) < 25 ? "text-red-500" : ""}
                ${parseInt(userCv.file) < 50 ? "text-orange-500" : ""}
                ${
                  parseInt(userCv.file) < 75
                    ? "text-yellow-500"
                    : "text-green-500"
                }
                font-semibold
              `}
                                                >
                                                  {userCv.file}
                                                </span>
                                              </TableCell>
                                              <TableCell className="max-w-[300px] break-words whitespace-normal">
                                                {userCv.description}
                                              </TableCell>
                                              <TableCell>
                                                <Dialog className="w-[1500px]">
                                                  <DialogTrigger>
                                                    <AiOutlineEye className="w-5 h-5 mr-2 text-primary bg-white hover:text-primary/50 border border-none rounded font-semibold" />
                                                  </DialogTrigger>
                                                  <DialogContent className="max-w-[1000px]">
                                                    <div>
                                                      <h1 className="border-b-2 font-semibold text-xl">
                                                        User Detail
                                                      </h1>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Address:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.address
                                                          }
                                                        </span>
                                                      </div>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Phone Number:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.phoneNumber
                                                          }
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <h1 className="border-b-2 font-semibold text-xl">
                                                      User CV
                                                    </h1>
                                                    <iframe
                                                      width="100%"
                                                      height="700px"
                                                      src={
                                                        userDetails[
                                                          userCv.userId
                                                        ]?.UserDetailData?.file
                                                      }
                                                    ></iframe>
                                                  </DialogContent>
                                                </Dialog>
                                              </TableCell>
                                              <TableCell className="flex gap-4 my-2">
                                                <Popover
                                                  key={userCv.id}
                                                  open={
                                                    openSchedule === userCv.id
                                                  }
                                                  onOpenChange={(isOpen) =>
                                                    setOpenSchedule(
                                                      isOpen ? userCv.id : null
                                                    )
                                                  }
                                                >
                                                  <PopoverTrigger
                                                    onClick={() => {
                                                      setOpenSchedule(
                                                        userCv.id
                                                      );
                                                      setScheduleForm({
                                                        ...scheduleForm,
                                                        cvPostId: userCv.id,
                                                        companyId: company.id,
                                                      });
                                                    }}
                                                    className="bg-white text-primary border border-primary hover:bg-primary hover:text-white rounded-md font-medium transition px-3 py-2"
                                                  >
                                                    Set Schedule
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-[500px] flex flex-col gap-6">
                                                    <div className="flex flex-col gap-y-3">
                                                      <Label>
                                                        Interview Date
                                                      </Label>
                                                      <Popover>
                                                        <PopoverTrigger asChild>
                                                          <Button
                                                            variant="outline"
                                                            className={`justify-start text-left font-normal ${
                                                              !scheduleForm.interviewDate &&
                                                              "text-muted-foreground"
                                                            }`}
                                                          >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {scheduleForm.interviewDate ? (
                                                              format(
                                                                scheduleForm.interviewDate,
                                                                "PPP"
                                                              )
                                                            ) : (
                                                              <span>
                                                                Pick a date
                                                              </span>
                                                            )}
                                                          </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                          align="start"
                                                          className="w-full p-0"
                                                        >
                                                          <Calendar
                                                            mode="single"
                                                            captionLayout="dropdown-buttons"
                                                            selected={
                                                              scheduleForm.timeEnd
                                                            }
                                                            onSelect={(
                                                              selectedDate
                                                            ) => {
                                                              const datetime =
                                                                new Date(
                                                                  selectedDate
                                                                );
                                                              const formattedDateTime =
                                                                format(
                                                                  datetime,
                                                                  "yyyy-MM-dd HH:mm:ss"
                                                                );
                                                              setScheduleForm({
                                                                ...scheduleForm,
                                                                interviewDate:
                                                                  formattedDateTime,
                                                              });
                                                            }}
                                                            fromYear={1960}
                                                            toYear={currentYear}
                                                            className="text-black w-full"
                                                            disabled={(date) =>
                                                              date <
                                                                new Date() ||
                                                              date <
                                                                new Date(
                                                                  "1900-01-01"
                                                                )
                                                            }
                                                            value={
                                                              scheduleForm.interviewDate
                                                            }
                                                          />
                                                        </PopoverContent>
                                                      </Popover>
                                                    </div>
                                                    {/* Input giờ và phút */}
                                                    <div className="flex items-center gap-2">
                                                      <Label>Time</Label>
                                                      <input
                                                        type="number"
                                                        placeholder="HH"
                                                        min="0"
                                                        max="23"
                                                        className="w-[60px] p-2 border rounded-md"
                                                        onChange={(e) => {
                                                          const hour =
                                                            parseInt(
                                                              e.target.value,
                                                              10
                                                            ) || 0;
                                                          handleUpdateTime(
                                                            hour,
                                                            "hour"
                                                          );
                                                        }}
                                                      />
                                                      :
                                                      <input
                                                        type="number"
                                                        placeholder="MM"
                                                        min="0"
                                                        max="59"
                                                        className="w-[60px] p-2 border rounded-md"
                                                        onChange={(e) => {
                                                          const minute =
                                                            parseInt(
                                                              e.target.value,
                                                              10
                                                            ) || 0;
                                                          handleUpdateTime(
                                                            minute,
                                                            "minute"
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                    <div>
                                                      <Label>
                                                        Interview Location
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        name="interviewLocation"
                                                        placeholder="Give the meeting position..."
                                                        className="rounded-lg border border-slate-200 my-3"
                                                        value={
                                                          scheduleForm.interviewLocation
                                                        }
                                                        onChange={
                                                          handleInputChange
                                                        }
                                                      />
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <Label>
                                                        Interview Note
                                                      </Label>
                                                      <textarea
                                                        type="text"
                                                        name="interviewNote"
                                                        placeholder="Give some notes for candidate..."
                                                        className="rounded-lg border border-slate-200 my-3 p-2"
                                                        value={
                                                          scheduleForm.interviewNote
                                                        }
                                                        onChange={
                                                          handleInputChange
                                                        }
                                                      />
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <Button
                                                        className="bg-white border border-black text-black hover:bg-slate-200"
                                                        onClick={() => {
                                                          setOpenSchedule(null);
                                                          setScheduleForm({
                                                            interviewDate: "",
                                                            interviewLocation:
                                                              "",
                                                            interviewNote: "",
                                                            companyId: "",
                                                            cvPostId: "",
                                                          });
                                                        }}
                                                      >
                                                        Close
                                                      </Button>
                                                      <Button
                                                        onClick={
                                                          handleSubmitForm
                                                        }
                                                        className="bg-white border border-primary hover:text-white"
                                                      >
                                                        Set Schedule
                                                      </Button>
                                                      {/* <GlobalLoadingMain
                                                        isSubmiting={isLoading}
                                                      /> */}
                                                    </div>
                                                  </PopoverContent>
                                                </Popover>

                                                {/* dialog confirm reject */}
                                                <Dialog open={rejectDialog}>
                                                  <DialogTrigger
                                                    onClick={() =>
                                                      setRejectDialog(true)
                                                    }
                                                    className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white px-4 py-2 font-medium transition rounded-md"
                                                  >
                                                    Reject
                                                  </DialogTrigger>
                                                  <DialogContent>
                                                    <DialogHeader>
                                                      <DialogTitle>
                                                        Reject{" "}
                                                        <span>
                                                          {" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.firstName
                                                          }{" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.lastName
                                                          }{" "}
                                                          ?
                                                        </span>
                                                      </DialogTitle>
                                                      <DialogDescription className="text-lg py-3">
                                                        This action cannot be
                                                        undone.
                                                      </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex justify-between">
                                                      <Button
                                                        onClick={() =>
                                                          setRejectDialog(false)
                                                        }
                                                        variant="outline"
                                                      >
                                                        Cancel
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                          handleReject(
                                                            userCv.id
                                                          )
                                                        }
                                                        className="border border-red-600 text-red-600 hover:text-white hover:bg-red-600"
                                                      >
                                                        Reject
                                                      </Button>
                                                      <GlobalLoadingMain
                                                        isSubmiting={isLoading}
                                                      />
                                                    </div>
                                                  </DialogContent>
                                                </Dialog>
                                              </TableCell>
                                            </TableRow>
                                          ) : null
                                        )
                                      ) : (
                                        <TableRow>
                                          <TableCell
                                            colSpan={7}
                                            className="text-center font-medium"
                                          >
                                            No CV here !!!
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            {/* table interview */}
                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <AccordionTrigger className="text-blue-700">
                                  INTERVIEW
                                </AccordionTrigger>
                                <AccordionContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Interview Date</TableHead>
                                        <TableHead>
                                          Interview Location
                                        </TableHead>
                                        <TableHead>CV</TableHead>
                                        <TableHead>Note</TableHead>
                                        <TableHead>Action</TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {userCVs[post.id]?.some(
                                        (userCv) =>
                                          userCv.statusCode === "INTERVIEW"
                                      ) ? (
                                        userCVs[post.id].map((userCv, index) =>
                                          userCv.statusCode === "INTERVIEW" ? (
                                            <TableRow key={index}>
                                              <TableCell className="font-medium">
                                                {userDetails[userCv.userId]
                                                  ?.image ? (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={
                                                      userDetails[userCv.userId]
                                                        ?.image
                                                    }
                                                  />
                                                ) : (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={defaultAvatar}
                                                  />
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.firstName
                                                }{" "}
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.lastName
                                                }
                                              </TableCell>
                                              <TableCell>
                                                <span
                                                  className={`
                px-2 py-1 rounded font-semibold
                ${
                  userCv.statusCode === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : ""
                }
                ${
                  userCv.statusCode === "INTERVIEW"
                    ? "bg-blue-100 text-blue-700"
                    : ""
                }
                ${
                  userCv.statusCode === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : ""
                }
                ${
                  userCv.statusCode === "PENDING"
                    ? "bg-slate-200 text-black"
                    : ""
                }
              `}
                                                >
                                                  {userCv.statusCode}
                                                </span>
                                              </TableCell>
                                              <TableCell>
                                                <span>
                                                  {new Date(
                                                    schedule[
                                                      userCv.id
                                                    ]?.interviewDate
                                                  ).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                      year: "numeric",
                                                    }
                                                  )}
                                                </span>
                                              </TableCell>
                                              <TableCell className="max-w-[300px] break-words whitespace-normal">
                                                {
                                                  schedule[userCv.id]
                                                    ?.interviewLocation
                                                }
                                              </TableCell>
                                              <TableCell>
                                                <Dialog className="w-[1500px]">
                                                  <DialogTrigger>
                                                    <AiOutlineEye className="w-5 h-5 mr-2 text-primary bg-white hover:text-primary/50 border border-none rounded font-semibold" />
                                                  </DialogTrigger>
                                                  <DialogContent className="max-w-[1000px]">
                                                    <div>
                                                      <h1 className="border-b-2 font-semibold text-xl">
                                                        User Detail
                                                      </h1>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Address:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.address
                                                          }
                                                        </span>
                                                      </div>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Phone Number:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.phoneNumber
                                                          }
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <h1 className="border-b-2 font-semibold text-xl">
                                                      User CV
                                                    </h1>
                                                    <iframe
                                                      width="100%"
                                                      height="700px"
                                                      src={
                                                        userDetails[
                                                          userCv.userId
                                                        ]?.UserDetailData?.file
                                                      }
                                                    ></iframe>
                                                  </DialogContent>
                                                </Dialog>
                                              </TableCell>
                                              <TableCell>
                                                {
                                                  schedule[userCv.id]
                                                    ?.interviewNote
                                                }
                                              </TableCell>
                                              <TableCell className="flex gap-4">
                                                <Dialog open={approveDialog}>
                                                  <DialogTrigger
                                                    onClick={() => {
                                                      setApproveDialog(true);
                                                    }}
                                                    className="border border-primary text-primary hover:text-white hover:bg-primary px-3 py-3 rounded-md transition font-medium"
                                                  >
                                                    Approve
                                                  </DialogTrigger>
                                                  <DialogContent>
                                                    <DialogHeader>
                                                      <DialogTitle>
                                                        Approve{" "}
                                                        <span>
                                                          {" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.firstName
                                                          }{" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.lastName
                                                          }
                                                        </span>
                                                      </DialogTitle>
                                                      <DialogDescription className="text-black">
                                                        This action cannot be
                                                        undone.
                                                        <span>
                                                          {" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.firstName
                                                          }{" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.lastName
                                                          }
                                                        </span>{" "}
                                                        will be your employee
                                                        !!!
                                                      </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex justify-between">
                                                      <Button
                                                        onClick={() =>
                                                          setApproveDialog(
                                                            false
                                                          )
                                                        }
                                                        variant="outline"
                                                      >
                                                        Cancel
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                          handleApprove(
                                                            userCv.id
                                                          );
                                                        }}
                                                        className="border border-primary text-primary hover:text-white hover:bg-primary"
                                                      >
                                                        Approve
                                                      </Button>
                                                      <GlobalLoadingMain
                                                        isSubmiting={isLoading}
                                                      />
                                                    </div>
                                                  </DialogContent>
                                                </Dialog>
                                                {/* dialog confirm reject */}
                                                <Dialog open={rejectDialog}>
                                                  <DialogTrigger
                                                    onClick={() =>
                                                      setRejectDialog(true)
                                                    }
                                                    className="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white px-4 py-2 font-medium transition rounded-md"
                                                  >
                                                    Reject
                                                  </DialogTrigger>
                                                  <DialogContent>
                                                    <DialogHeader>
                                                      <DialogTitle>
                                                        Reject{" "}
                                                        <span>
                                                          {" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.firstName
                                                          }{" "}
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.lastName
                                                          }{" "}
                                                          ?
                                                        </span>
                                                      </DialogTitle>
                                                      <DialogDescription className="text-lg py-3">
                                                        This action cannot be
                                                        undone.
                                                      </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex justify-between">
                                                      <Button
                                                        onClick={() =>
                                                          setRejectDialog(false)
                                                        }
                                                        variant="outline"
                                                      >
                                                        Cancel
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                          handleReject(
                                                            userCv.id
                                                          )
                                                        }
                                                        className="border border-red-600 text-red-600 hover:text-white hover:bg-red-600"
                                                      >
                                                        Reject
                                                      </Button>
                                                      <GlobalLoadingMain
                                                        isSubmiting={isLoading}
                                                      />
                                                    </div>
                                                  </DialogContent>
                                                </Dialog>
                                              </TableCell>
                                            </TableRow>
                                          ) : null
                                        )
                                      ) : (
                                        <TableRow>
                                          <TableCell
                                            colSpan={6}
                                            className="text-center font-medium"
                                          >
                                            No CV here !!!
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                            {/* table reject */}
                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <AccordionTrigger className="text-red-700">
                                  REJECTED
                                </AccordionTrigger>
                                <AccordionContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>

                                        <TableHead>Status</TableHead>
                                        <TableHead>Percentage Match</TableHead>
                                        <TableHead className="text-left">
                                          Description
                                        </TableHead>
                                        <TableHead>CV</TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {userCVs[post.id]?.some(
                                        (userCv) =>
                                          userCv.statusCode === "REJECTED"
                                      ) ? (
                                        userCVs[post.id].map((userCv, index) =>
                                          userCv.statusCode === "REJECTED" ? (
                                            <TableRow key={index}>
                                              <TableCell className="font-medium">
                                                {userDetails[userCv.userId]
                                                  ?.image ? (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={
                                                      userDetails[userCv.userId]
                                                        ?.image
                                                    }
                                                  />
                                                ) : (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={defaultAvatar}
                                                  />
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.firstName
                                                }{" "}
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.lastName
                                                }
                                              </TableCell>
                                              <TableCell>
                                                <span
                                                  className={`
                px-2 py-1 rounded font-semibold
                ${
                  userCv.statusCode === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : ""
                }
                ${
                  userCv.statusCode === "INACTIVE"
                    ? "bg-yellow-100 text-yellow-700"
                    : ""
                }
                ${
                  userCv.statusCode === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : ""
                }
                ${
                  userCv.statusCode === "PENDING"
                    ? "bg-slate-200 text-black"
                    : ""
                }
              `}
                                                >
                                                  {userCv.statusCode}
                                                </span>
                                              </TableCell>
                                              <TableCell>
                                                <span
                                                  className={`
                ${parseInt(userCv.file) < 25 ? "text-red-500" : ""}
                ${parseInt(userCv.file) < 50 ? "text-orange-500" : ""}
                ${
                  parseInt(userCv.file) < 75
                    ? "text-yellow-500"
                    : "text-green-500"
                }
                font-semibold
              `}
                                                >
                                                  {userCv.file}
                                                </span>
                                              </TableCell>
                                              <TableCell className="max-w-[300px] break-words whitespace-normal">
                                                {userCv.description}
                                              </TableCell>
                                              <TableCell>
                                                <Dialog className="w-[1500px]">
                                                  <DialogTrigger>
                                                    <AiOutlineEye className="w-5 h-5 mr-2 text-primary bg-white hover:text-primary/50 border border-none rounded font-semibold" />
                                                  </DialogTrigger>
                                                  <DialogContent className="max-w-[1000px]">
                                                    <div>
                                                      <h1 className="border-b-2 font-semibold text-xl">
                                                        User Detail
                                                      </h1>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Address:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.address
                                                          }
                                                        </span>
                                                      </div>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Phone Number:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.phoneNumber
                                                          }
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <h1 className="border-b-2 font-semibold text-xl">
                                                      User CV
                                                    </h1>
                                                    <iframe
                                                      width="100%"
                                                      height="700px"
                                                      src={
                                                        userDetails[
                                                          userCv.userId
                                                        ]?.UserDetailData?.file
                                                      }
                                                    ></iframe>
                                                  </DialogContent>
                                                </Dialog>
                                              </TableCell>
                                            </TableRow>
                                          ) : null
                                        )
                                      ) : (
                                        <TableRow>
                                          <TableCell
                                            colSpan={7}
                                            className="text-center font-medium"
                                          >
                                            No CV here !!!
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            {/* table approve */}
                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <AccordionTrigger className="text-green-700">
                                  APPROVED
                                </AccordionTrigger>
                                <AccordionContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>

                                        <TableHead>Status</TableHead>
                                        <TableHead>Percentage Match</TableHead>
                                        <TableHead className="text-left">
                                          Description
                                        </TableHead>
                                        <TableHead>CV</TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {userCVs[post.id]?.some(
                                        (userCv) =>
                                          userCv.statusCode === "APPROVED"
                                      ) ? (
                                        userCVs[post.id].map((userCv, index) =>
                                          userCv.statusCode === "APPROVED" ? (
                                            <TableRow key={index}>
                                              <TableCell className="font-medium">
                                                {userDetails[userCv.userId]
                                                  ?.image ? (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={
                                                      userDetails[userCv.userId]
                                                        ?.image
                                                    }
                                                  />
                                                ) : (
                                                  <img
                                                    className="rounded-full w-14 h-14"
                                                    src={defaultAvatar}
                                                  />
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.firstName
                                                }{" "}
                                                {
                                                  userDetails[userCv.userId]
                                                    ?.lastName
                                                }
                                              </TableCell>
                                              <TableCell>
                                                <span
                                                  className={`
                px-2 py-1 rounded font-semibold
                ${
                  userCv.statusCode === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : ""
                }
                ${
                  userCv.statusCode === "INACTIVE"
                    ? "bg-yellow-100 text-yellow-700"
                    : ""
                }
                ${
                  userCv.statusCode === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : ""
                }
                ${
                  userCv.statusCode === "PENDING"
                    ? "bg-slate-200 text-black"
                    : ""
                }
              `}
                                                >
                                                  {userCv.statusCode}
                                                </span>
                                              </TableCell>
                                              <TableCell>
                                                <span
                                                  className={`
                ${parseInt(userCv.file) < 25 ? "text-red-500" : ""}
                ${parseInt(userCv.file) < 50 ? "text-orange-500" : ""}
                ${
                  parseInt(userCv.file) < 75
                    ? "text-yellow-500"
                    : "text-green-500"
                }
                font-semibold
              `}
                                                >
                                                  {userCv.file}
                                                </span>
                                              </TableCell>
                                              <TableCell className="max-w-[300px] break-words whitespace-normal">
                                                {userCv.description}
                                              </TableCell>
                                              <TableCell>
                                                <Dialog className="w-[1500px]">
                                                  <DialogTrigger>
                                                    <AiOutlineEye className="w-5 h-5 mr-2 text-primary bg-white hover:text-primary/50 border border-none rounded font-semibold" />
                                                  </DialogTrigger>
                                                  <DialogContent className="max-w-[1000px]">
                                                    <div>
                                                      <h1 className="border-b-2 font-semibold text-xl">
                                                        User Detail
                                                      </h1>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Address:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.address
                                                          }
                                                        </span>
                                                      </div>
                                                      <div className="flex gap-2">
                                                        <h1 className="font-semibold">
                                                          Phone Number:{" "}
                                                        </h1>
                                                        <span>
                                                          {
                                                            userDetails[
                                                              userCv.userId
                                                            ]?.phoneNumber
                                                          }
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <h1 className="border-b-2 font-semibold text-xl">
                                                      User CV
                                                    </h1>
                                                    <iframe
                                                      width="100%"
                                                      height="700px"
                                                      src={
                                                        userDetails[
                                                          userCv.userId
                                                        ]?.UserDetailData?.file
                                                      }
                                                    ></iframe>
                                                  </DialogContent>
                                                </Dialog>
                                              </TableCell>
                                            </TableRow>
                                          ) : null
                                        )
                                      ) : (
                                        <TableRow>
                                          <TableCell
                                            colSpan={7}
                                            className="text-center font-medium"
                                          >
                                            No CV here !!!
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                            <GlobalLoadingMain isSubmiting={isLoading} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        {userCVs[post.id]?.length || 0}/
                        {post.postDetailData.amount}
                      </TableCell>
                      <TableCell className="text-right">
                        {userCVs[post.id]?.length >=
                          post.postDetailData.amount ||
                        date > new Date(post.timeEnd) ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  onClick={() => {
                                    setCloseDialog(true);
                                  }}
                                  className="bg-white border border-red-500 text-red-500 hover:text-white hover:bg-red-500"
                                >
                                  CLOSED
                                </Button>
                                <Dialog
                                  open={closeDialog}
                                  onOpenChange={() => setCloseDialog(false)}
                                >
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Close this post ?
                                      </DialogTitle>
                                      <DialogDescription>
                                        You have reached your target, click
                                        &quot;Confirm&quot; to close this post
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button
                                        className="bg-white border border-primary hover:bg-primary hover:text-white"
                                        onClick={() => closePost(post.id)}
                                      >
                                        Confirm
                                      </Button>
                                      <GlobalLoadingMain
                                        isSubmiting={isLoading}
                                      />
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Close this post if you reach your target !
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span
                            className={`
                        px-2 py-1 rounded font-semibold uppercase
                        ${
                          post.statusCode.toUpperCase() === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : ""
                        }
                        ${
                          post.statusCode.toUpperCase() === "BANNED"
                            ? "bg-yellow-100 text-yellow-700"
                            : ""
                        }
                        ${
                          post.statusCode.toUpperCase() === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : ""
                        }
                        ${
                          post.statusCode.toUpperCase() === "PENDING"
                            ? "bg-slate-300 text-slate-700"
                            : ""
                        }
                      `}
                          >
                            {post.statusCode}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="closed">
          {/* table closed */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {post.map(
                (post) =>
                  post.statusCode === "CLOSED" && (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">
                        {post.postDetailData.name}
                      </TableCell>
                      <TableCell className=" max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {post.postDetailData.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="bg-red-600 text-red-200 p-2 rounded-sm">
                          {post.statusCode}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageJobPost;
