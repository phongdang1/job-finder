import { useSelector, useDispatch } from "react-redux";
import { logout, setUser } from "../../../redux/features/authSlice";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import { useEffect, useState } from "react";
import axios from "../../../fetchData/axios";
import logoText from "../../../assets/images/JobFinder_logoText.png";
import logo from "../../../assets/images/JobFinder_logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IoMdArrowDropdown,
  IoMdNotifications,
  IoMdNotificationsOutline,
} from "react-icons/io";
import { io } from "socket.io-client";
import {
  Circle,
  CircleNotifications,
  CircleNotificationsOutlined,
  Notifications,
} from "@mui/icons-material";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleCheckNotification } from "@/fetchData/Notification";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const company = localStorage.getItem("company");
  const adminId = localStorage.getItem("adminId");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("roleCode");
    navigate("/");
  };
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      token: params.get("token"),
      userId: params.get("userId"),
    };
  }
  useEffect(() => {
    const { token, userId } = getQueryParams();

    if (token && userId) {
      // Lưu thông tin vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", userId);
      localStorage.setItem("roleCode", "USER");

      // Điều hướng đến trang chính
      navigate("/");
    }
  }, []);
  const fetchUser = async (userId) => {
    try {
      const response = await axios.get(`/getUserById?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });

      console.log("Response from /getUserById:", response);

      if (response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data)); // Lưu thông tin người dùng vào localStorage
        console.log("User data set in Redux and localStorage:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
      const response = await axios.get(
        `/getAllNotificationByUserId?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Thêm token vào headers
          },
        }
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
    socket.on("cvPostInterView", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("Company Approved Event:", msg);
    });

    socket.on("cvPostApproved", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("Company Approved Event:", msg);
    });

    socket.on("cvPostRejected", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("Company Approved Event:", msg);
    });

    socket.on("ReceivedMail", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("Company Approved Event:", msg);
    });

    socket.on("inviteApplyJob", (msg) => {
      setNotificationCount((prevCount) => prevCount + 1);
      console.log("Company Approved Event:", msg);
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
    <div
      className={`flex justify-between sticky top-0 px-6 md:px-16 lg:pr-36 lg:pl-20 py-4 md:py-6 items-center font-poppins z-50 
    transition-all duration-300 ease-in-out 
    ${isScrolled ? "bg-secondary border-b-2 shadow-md " : "bg-transparent"}`}
    >
      {/* Logo */}
      <div className="flex items-center ml-16">
        <Link to="/" className="text-lg font-semibold">
          <img
            className="w-full h-16 hidden lg:block"
            src={logoText}
            alt="JobFinder Logo"
          />
          <img
            className="w-full h-16 lg:hidden block"
            src={logo}
            alt="JobFinder Logo"
          />
        </Link>
      </div>

      {/* nav */}
      <div className="flex gap-4 md:gap-8 items-center">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger>
              <MenuIcon className="text-primary" />
            </SheetTrigger>
            <SheetContent className="pt-16 space-y-4">
              {/* login, register */}
              {(userId != null ||
                userId != undefined ||
                token != null ||
                token != undefined ||
                !company ||
                !adminId) && (
                <SheetHeader>
                  <Link to="/userProfile">
                    <p className="text-center text-lg font-medium">
                      Hello, {user?.data?.firstName} !
                    </p>
                  </Link>
                </SheetHeader>
              )}
              {/* những component còn lại */}
              <SheetHeader>
                <SheetClose asChild>
                  <Link
                    className="text-center hover:text-primary text-lg font-medium"
                    to="/"
                  >
                    Home
                  </Link>
                </SheetClose>
              </SheetHeader>
              <SheetHeader>
                <SheetClose asChild>
                  <Link
                    className="text-center hover:text-primary text-lg font-medium"
                    to="/jobs"
                  >
                    Jobs
                  </Link>
                </SheetClose>
              </SheetHeader>
              <SheetHeader>
                <SheetClose asChild>
                  <Link
                    className="text-center hover:text-primary text-lg font-medium"
                    to="/companypage"
                  >
                    Company
                  </Link>
                </SheetClose>
              </SheetHeader>

              {/* nút logout */}
              {userId === null ||
              userId === undefined ||
              token === null ||
              token === undefined ? (
                <>
                  <SheetHeader>
                    <SheetClose asChild>
                      <Link
                        className="text-center text-primary hover:text-primary text-lg font-medium"
                        to="/signup"
                      >
                        Register
                      </Link>
                    </SheetClose>
                  </SheetHeader>
                  <SheetHeader>
                    <SheetClose asChild>
                      <Link
                        to="/login"
                        className="flex items-center justify-center"
                      >
                        <Button className="text-center border border-primary bg-white hover:text-primary text-lg font-medium">
                          Login{" "}
                        </Button>
                      </Link>
                    </SheetClose>
                  </SheetHeader>
                </>
              ) : (
                <SheetHeader>
                  <button
                    onClick={handleLogout}
                    className="text-center text-red-600 hover:text-red-700 text-lg font-medium"
                  >
                    Logout
                  </button>
                </SheetHeader>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <ul className="hidden md:hidden sm:hidden lg:flex gap-8 items-center text-third text-md font-medium">
          <li className="hover:text-primary">
            <Button
              className=" text-third hover:bg-transparent  hover:text-primary"
              variant="ghost"
            >
              <Link to="/">Home</Link>
            </Button>
          </li>
          <li className="hover:text-primary">
            <Button
              className=" text-third hover:bg-transparent hover:text-primary"
              variant="ghost"
            >
              <Link to="/jobs">Jobs</Link>
            </Button>
          </li>
          <li className="hover:text-primary">
            <Button
              className=" text-third hover:bg-transparent hover:text-primary"
              variant="ghost"
            >
              <Link to="/companypage">Company</Link>
            </Button>
          </li>
          {userId === null ||
          userId === undefined ||
          token === null ||
          token === undefined ? (
            <>
              <li>
                <Button
                  className="font-semibold hover:bg-transparent text-primary"
                  variant="ghost"
                >
                  <Link to="/signup">Register</Link>
                </Button>
              </li>
              <li>
                <Button
                  className="bg-secondary text-primary hover:bg-primary hover:text-secondary border-primary"
                  variant="outline"
                >
                  <Link to="/login">Login</Link>
                </Button>
              </li>
            </>
          ) : (
            <div className="flex items-center space-x-4 relative">
              {/* // bell */}
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
                      src={user?.data?.image}
                      className="cursor-pointer"
                    />
                    <button className="absolute -right-2 bottom-0   bg-background rounded-full">
                      <IoMdArrowDropdown className="w-5 h-5" />
                    </button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2">
                  <DropdownMenuLabel>
                    Hello, {user?.data?.firstName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/userProfile/personalInfo"
                      className="cursor-pointer"
                    >
                      User Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/userProfile/advancedSetting"
                      className="cursor-pointer"
                    >
                      Advance Setting
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/userProfile/changePassword"
                      className="cursor-pointer"
                    >
                      Change Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/userProfile/viewApplication"
                      className="cursor-pointer"
                    >
                      Your Application
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={handleLogout}
                      className="text-red-500 hover:text-red-700 cursor-pointer w-full font-semibold"
                    >
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Header;
