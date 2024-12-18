import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/images/JobFinder_logoText.png";
import { Button } from "@/components/ui/button";
import Logout from "@/components/Common/Authentication/Logout";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import MenuIcon from "@mui/icons-material/Menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@mui/material";
import { IoMdArrowDropdown } from "react-icons/io";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/authSlice";
import { getCompanyById } from "@/fetchData/Company";
import { FaCirclePlus } from "react-icons/fa6";
import { handleCheckNotification } from "@/fetchData/Notification";
import { io } from "socket.io-client";
import axios from "../../../fetchData/axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Circle, Notifications } from "@mui/icons-material";
import { ScrollArea } from "@/components/ui/scroll-area";

const CompanyHeader = () => {
  // const companyData = JSON.parse(localStorage.getItem("company"));
  const companyId = JSON.parse(localStorage.getItem("companyId"));
  const userId = localStorage.getItem("user_id");

  const [user, setUser] = useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("companyId");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("roleCode");
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    navigate("/");
    // fetchCompany();
  };

  const fetchCompany = async (companyId) => {
    try {
      const response = await getCompanyById(companyId);
      console.log(companyId);
      console.log("Response ", response.data);

      if (response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data)); // Lưu thông tin người dùng vào localStorage
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    fetchCompany(companyId);
  }, []);

  // socketIO
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]); // Danh sách thông báo
  const [showNotifications, setShowNotifications] = useState(false);
  // socket io
  const socket = io("https://be-jobfinder-final.onrender.com", {
    transports: ["websocket"],
    query: {
      userId: userId,
    },
  });

  const fetchNotifications = async (userId) => {
    try {
      console.log("Fetching notifications for user:", userId);
      //console.log("tk", localStorage.getItem("token"));

      const response = await axios.get(
        `/getAllNotificationByUserId?userId=${userId}`
      );
      console.log("Response from /getAllNotificationByUserId:", response);

      if (response.data) {
        // Lưu thông báo vào state

        setNotifications(response.data.data);
        console.log("not", notifications); // Lưu thông báo vào state
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // useEffect để xử lý socket io
  useEffect(() => {
    // Lắng nghe sự kiện từ server (ví dụ: công ty đã được duyệt)
    socket.on("companyApproved", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("Approved:", msg);
    });

    socket.on("companyReject", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("companyReject:", msg);
    });

    socket.on("postApproved", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("postApproved:", msg);
    });

    socket.on("postRejected", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("postRejected:", msg);
    });

    socket.on("applyJob", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("postRejected:", msg);
    });

    socket.on("autoBanPost", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("postRejected:", msg);
    });

    // Lắng nghe khi kết nối hoặc mất kết nối
    socket.on("connect", () => {
      console.log("Đã kết nối với server Socket.IO");
    });

    socket.on("disconnect", () => {
      console.log("Mất kết nối với server Socket.IO");
    });

    // Dọn dẹp khi component bị hủy (ngắt kết nối)
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const handleClickBell = () => {
    setNotificationCount(0);
    fetchNotifications(userId); // Gọi API để lấy thông báo
    setShowNotifications(true); // Reset khi người dùng nhấp vào chuông thông báo
  };

  const [watch, setWatch] = useState(false);
  const handleIsWatched = async (notificationId) => {
    // Optimistically update the notification in state
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, isChecked: 1 } : notif
      )
    );

    // Send the update request to the backend
    await handleCheckNotification(notificationId);
  };

  return (
    <>
      <header className="flex shadow-lg py-4 px-4 sm:px-10 bg-white  min-h-[70px] tracking-wide sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between gap-4 w-full mx-16">
          {/* logo */}
          <div className="flex justify-center">
            <Link to="/company/dashboard">
              <img src={logo} alt="logo" className="w-40" />
            </Link>
          </div>
          {/* nav */}
          <div className="max-lg:hidden lg:!block max-lg:w-full max-lg:fixed max-lg:before:fixed max-lg:before:bg-black max-lg:before:opacity-50 max-lg:before:inset-0 max-lg:before:z-50">
            <button
              id="toggleClose"
              className="lg:hidden fixed top-2 right-4 z-[100] rounded-full bg-white p-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 fill-black"
                viewBox="0 0 320.591 320.591"
              >
                <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"></path>
                <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"></path>
              </svg>
            </button>

            <ul className="lg:flex lg:gap-x-5 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-1/2 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50 items-center">
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <Link
                  to="/company/dashboard"
                  className={`block font-semibold text-[15px] ${
                    user?.data?.statusCode.toUpperCase() !== "APPROVED"
                      ? "text-gray-400 cursor-not-allowed pointer-events-none"
                      : "hover:text-primary text-third"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <Link
                  to="/company/jobPost"
                  className={`block font-semibold text-[15px] ${
                    user?.data?.statusCode.toUpperCase() !== "APPROVED"
                      ? "text-gray-400 cursor-not-allowed pointer-events-none"
                      : "hover:text-primary text-third"
                  }`}
                >
                  Job Post
                </Link>
              </li>
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <Link
                  to="/company/candidate"
                  className={`block font-semibold text-[15px] ${
                    user?.data?.statusCode.toUpperCase() !== "APPROVED"
                      ? "text-gray-400 cursor-not-allowed pointer-events-none"
                      : "hover:text-primary text-third"
                  }`}
                >
                  Candidate
                </Link>
              </li>
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <Link
                  to="/company/product"
                  className={`block font-semibold text-[15px] ${
                    user?.data?.statusCode.toUpperCase() !== "APPROVED"
                      ? "text-gray-400 cursor-not-allowed pointer-events-none"
                      : "hover:text-primary text-third"
                  }`}
                >
                  Product
                </Link>
              </li>
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <Link
                  to="/company/createJobPost"
                  className={`block font-semibold text-[15px] ${
                    user?.data?.statusCode.toUpperCase() !== "APPROVED"
                      ? "text-gray-400 cursor-not-allowed pointer-events-none"
                      : "hover:text-primary text-third"
                  }`}
                >
                  <Button
                    disabled={user?.data?.statusCode.toUpperCase() !== "APPROVED"}
                    className="text-white flex gap-2"
                  >
                    <FaCirclePlus />
                    Create New Post
                  </Button>
                </Link>
              </li>
            </ul>
          </div>

          {/* user chỗ ni */}
          {companyId === null || companyId === undefined ? (
            <div className="hidden lg:flex items-center ml-auto space-x-6">
              <Button
                className="font-semibold text-primary hover:text-white hover:bg-primary"
                variant="ghost"
              >
                <Link to="/signup">Sign up</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full lg:w-auto border border-primary text-primary bg-white hover:bg-primary hover:text-white"
              >
                Login
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 relative">
              {userId != null || userId != undefined ? (
                <Popover>
                  <PopoverTrigger>
                    <div
                      onClick={() => handleClickBell()}
                      className="relative flex items-center gap-4 cursor-pointer"
                    >
                      <div
                        className={`${notificationCount > 0 ? "shake" : ""}`}
                      >
                        <Notifications
                          sx={{ fontSize: 40, color: "#9080f4" }}
                          className="p-[6px]"
                        />
                      </div>

                      {/* Số thông báo */}
                      {notificationCount > 0 && (
                        <span className="absolute top-1 right-0 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="p-2 text-lg font-medium sticky top-0 z-30">
                      Notification
                    </div>
                    <ul className="space-y-2">
                      <ScrollArea className="h-96">
                        {notifications.map((notification, index) => (
                          <li
                            key={index}
                            className={`flex justify-between items-center p-4 hover:rounded-lg hover:bg-primary/10 cursor-pointer gap-2 ${
                              notification.isChecked === 1
                                ? "text-gray-400"
                                : ""
                            }`}
                            onClick={() => handleIsWatched(notification?.id)}
                          >
                            <div className="text-sm text-wrap">
                              {notification?.content}
                            </div>

                            <div
                              className={`text-primary animate-bounce ${
                                notification.isChecked === 1 ? "hidden" : ""
                              }`}
                            >
                              <Circle sx={{ fontSize: 15 }} />
                            </div>
                          </li>
                        ))}
                      </ScrollArea>
                    </ul>
                  </PopoverContent>
                </Popover>
              ) : (
                " "
              )}
              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="ring-0 border-0">
                  <div className="flex active:opacity-60">
                    <Avatar
                      alt={user?.data?.phoneNumber}
                      src={user?.data?.thumbnail}
                      className="cursor-pointer"
                    />
                    <button className="absolute -right-2 bottom-0   bg-background rounded-full">
                      <IoMdArrowDropdown className="w-5 h-5" />
                    </button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                  <DropdownMenuLabel>
                    Hello, {user?.data?.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/companyProfile/profile"
                      className="cursor-pointer"
                    >
                      Company Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      className="text-red-500 font-semibold cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="lg:hidden flex items-center">
          <Sheet>
            <SheetTrigger>
              <MenuIcon className="text-primary" />
            </SheetTrigger>
            <SheetContent className="pt-16 space-y-4">
              {/* login, register */}
              {/* {(user != null || user != undefined) && (
                <SheetHeader>
                  <Link to="/userProfile">
                    <p className="text-center text-lg font-medium">
                      Hello, {user?.data?.firstName} !
                    </p>
                  </Link>
                </SheetHeader>
              )} */}
              {/* những component còn lại
              <SheetHeader>
                <SheetClose asChild>
                  <Link
                    className="text-center hover:bg-secondary hover:text-primary text-lg font-medium"
                    to="/"
                  >
                    Dashboard
                  </Link>
                </SheetClose>
              </SheetHeader>
              <SheetHeader>
                <SheetClose asChild>
                  <Link
                    className="text-center hover:bg-secondary hover:text-primary text-lg font-medium"
                    to="/jobPost"
                  >
                    Job Post
                  </Link>
                </SheetClose>
              </SheetHeader>
              <SheetHeader>
                <SheetClose asChild>
                  <Link
                    className="text-center hover:bg-secondary hover:text-primary text-lg font-medium"
                    to="/companypage"
                  >
                    Candidate
                  </Link>
                </SheetClose>
              </SheetHeader>

              <SheetHeader>
                <SheetClose asChild>
                  <Link
                    className="text-center hover:bg-secondary hover:text-primary text-lg font-medium"
                    to="/companypage"
                  >
                    Transaction
                  </Link>
                </SheetClose>
              </SheetHeader>

              {/* nút logout */}
              {user === null || user === undefined ? (
                <>
                  <SheetHeader>
                    <SheetClose asChild>
                      <Link
                        className="text-center hover:bg-secondary hover:text-primary text-lg font-medium"
                        to="/signup"
                      >
                        Register
                      </Link>
                    </SheetClose>
                  </SheetHeader>
                  <SheetHeader>
                    <SheetClose asChild>
                      <Link
                        className="text-center hover:bg-secondary hover:text-primary text-lg font-medium"
                        to="/login"
                      >
                        Login
                      </Link>
                    </SheetClose>
                  </SheetHeader>
                </>
              ) : (
                <SheetHeader>
                  <Logout />
                </SheetHeader>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
};

export default CompanyHeader;
