import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import Bg from "../../../src/assets/Home/Home/defaultavatar.png";
import { getUsersById, handleSetDataUserDetail } from "@/fetchData/User";
import { ArrowCircleUpTwoTone } from "@mui/icons-material";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiVipCrownFill } from "react-icons/ri";
import loadingAnimation from "../../assets/animation/loadingAnimation.json";
import Lottie from "lottie-react";
import axios from "axios";

function UserProfilePage() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const userId = localStorage.getItem("user_id");
  const [selectedItem, setSelectedItem] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [saveAvatar, setSaveAvatar] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoading, setIsLoading] = useState(false);
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      getBase64(file)
        .then((base64) => {
          setImage(base64);
        })
        .catch((error) => {
          console.error("Error converting file to base64: ", error);
        });
    }
  };

  const uploadImage = async (image) => {
    console.log("img", image);
    if (saveAvatar) {
      setUploading(true);
      try {
        const userDataImage = {
          userId: userId,
          image: image,
          data: {},
        };

        await handleSetDataUserDetail(userDataImage);
        setUploading(false);
        setUploadComplete(true);
      } catch (error) {
        console.error("Error uploading image to backend: ", error);
        setUploading(false);
      }
    }
  };

  const [data, setData] = useState(localStorage.getItem("user").data);
  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `https://be-jobfinder-final.onrender.com/getUserById?id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const user = response.data.data;
      setData(user);
      setImage(user?.image);
      console.log('user ne con cho',userId);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (saveAvatar) {
      console.log("avatar", saveAvatar, image);
      uploadImage(image);
      setSaveAvatar(true);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
    setTimeout(() => {
      setSaveAvatar(false);
    }, 4000);
  }, [saveAvatar, image]);

  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/userProfile/personalInfo")) {
      setSelectedItem("personalInfo");
    } else if (path.includes("/userProfile/advancedSetting")) {
      setSelectedItem("advancedSetting");
    } else if (path.includes("/userProfile/changePassword")) {
      setSelectedItem("changePassword");
    } else if (path.includes("/userProfile/viewApplication")) {
      setSelectedItem("viewApplication");
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col w-full lg:w-1/3 items-center text-center space-y-4 relative">
      <div className="bg-white w-full rounded-lg py-8 ">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="ml-4">
            <div
              className="h-32 w-32 bg-contain bg-center mx-auto rounded-full relative"
              style={{
                backgroundImage: `url(${saveAvatar ? image : data?.image})`,
                backgroundSize: "cover",
              }}
            >
              <Badge
                className={`absolute right-10 w-24 text-white ${
                  data?.isVerify === 1
                    ? "bg-green-500 hover:bg-green-500"
                    : "bg-red-500 hover:bg-red-500"
                }`}
              >
                <p>{data?.isVerify === 1 ? "Verified" : "Not Verified"}</p>
              </Badge>
              <Dialog>
                <DialogTrigger>
                  <button>
                    <UploadFileOutlinedIcon
                      className="bg-white rounded-full  text-primary border border-gray-200 hover:bg-primary hover:text-secondary border-primary p-1 absolute right-1 top-24 cursor-pointer"
                      sx={{ fontSize: 35 }}
                    />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Avatar</DialogTitle>
                    <DialogDescription>
                      <div className="flex justify-between h-44 mt-4 gap-8">
                        <div className="w-full h-full">
                          <div>
                            <Button
                              className="w-full h-40 bg-transparent border border-dashed text-gray-300 hover:bg-white hover:text-primary"
                              onClick={() =>
                                document.getElementById("file-upload").click()
                              }
                            >
                              Click here to change your Avatar
                            </Button>
                          </div>
                        </div>
                        <div className="mr-8">
                          <p>This is your avatar</p>
                          <div
                            className="h-32 w-32 bg-contain bg-center mx-auto rounded-full relative"
                            style={{
                              backgroundImage: `url(${image ? image : Bg})`,
                              backgroundSize: "cover",
                            }}
                          ></div>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="border border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => setSaveAvatar(true)}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                  <Lottie
                    className={`absolute left-[150px] opacity-55 ${
                      saveAvatar ? "block" : "hidden"
                    }  z-10 w-[300px] h-[300px]`}
                    animationData={loadingAnimation}
                    loop={true}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
          <div className="flex flex-col text-start space-y-2">
            <div className="text-medium font-medium text-primary">
              <p className="text-black">Welcome,</p>
              <p>
                {data?.firstName} {data?.lastName}
              </p>
            </div>

            {data?.isVerify === 1 ? (
              <div className="text-sm font-medium border border-gray-200 p-1 text-white bg-green-500 shadow-inner w-36">
                Account is Verified
              </div>
            ) : (
              <div className="text-sm font-medium border border-gray-200 p-1 text-white bg-red-500 shadow-inner w-44">
                Account is not Verified
              </div>
            )}
            {user.data?.isVip !== 1 ? (
              <div className="text-sm font-medium border border-gray-200 p-[2px] flex items-center gap-2 rounded-3xl cursor-pointer">
                <ArrowCircleUpTwoTone className="text-primary" />
                <Link to="/vip">Upgrade to Pro</Link>
              </div>
            ) : (
              <div className="text-sm font-semibold flex gap-2 p-1 items-center">
                <RiVipCrownFill className="text-yellow-500 w-5 h-5" />
                <p>VIP Member</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 text-center  w-full">
        <div className={`bg-white rounded-lg w-full `}>
          <Link to="/userProfile/personalInfo">
            <div
              className={`flex gap-2 justify-center cursor-pointer w-full items-center text-primary hover:bg-primary hover:text-white p-3 hover:rounded-md ${
                selectedItem === "personalInfo"
                  ? "bg-primary text-white rounded-md"
                  : ""
              }`}
              onClick={() => setSelectedItem("personalInfo")}
            >
              <AccountCircleOutlinedIcon />
              <p>Personal Information</p>
            </div>
          </Link>
        </div>

        <div className={`bg-white rounded-lg w-full `}>
          <Link to="/userProfile/advancedSetting">
            <div
              className={`flex gap-2 justify-center cursor-pointer w-full items-center text-primary hover:bg-primary hover:text-white p-3 hover:rounded-md ${
                selectedItem === "advancedSetting"
                  ? "bg-primary text-white rounded-md"
                  : ""
              }`}
              onClick={() => setSelectedItem("advancedSetting")}
            >
              <SettingsSuggestOutlinedIcon />
              <p>Advanced Settings</p>
            </div>
          </Link>
        </div>

        <div className={`bg-white rounded-lg w-full `}>
          <Link to="/userProfile/changePassword">
            <div
              className={`flex gap-2 justify-center cursor-pointer w-full items-center text-primary hover:bg-primary hover:text-white p-3 hover:rounded-md ${
                selectedItem === "changePassword"
                  ? "bg-primary text-white rounded-md"
                  : ""
              }`}
              onClick={() => setSelectedItem("changePassword")}
            >
              <AdminPanelSettingsOutlinedIcon />
              <p>Account Security</p>
            </div>
          </Link>
        </div>

        <div className={`bg-white rounded-lg w-full `}>
          <Link to="/userProfile/viewApplication">
            <div
              className={`flex gap-2 justify-center cursor-pointer w-full items-center text-primary hover:bg-primary hover:text-white p-3 hover:rounded-md ${
                selectedItem === "viewApplication"
                  ? "bg-primary text-white rounded-md"
                  : ""
              }`}
              onClick={() => setSelectedItem("viewApplication")}
            >
              <DescriptionOutlinedIcon />
              <p>Your Application</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
