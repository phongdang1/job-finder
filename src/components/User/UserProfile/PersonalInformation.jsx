import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { sendOtp, verifyOtp } from "../../../fetchData/OTP";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";

import { useState, useEffect, useRef } from "react";
import Validation from "@/components/User/Common/Validation";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { CheckOutlined, WarningAmberOutlined } from "@mui/icons-material";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
function PersonalInformation() {
  const userId = localStorage.getItem("user_id");
  const [date, setDate] = useState();
  const [inputValue, setInputValue] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    email: "",
    skills: [],
    gender: "",
    dob: "",
    file: "",
  });
  const [originalUserData, setOriginalUserData] = useState(null); // Store original data
  const [errorMessage, setErrorMessage] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [verify, setVerify] = useState(false);
  const [otp, setOtp] = useState("");
  const [isCompleteOTP, setIsCompleteOTP] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef(null);
  const token = localStorage.getItem("token");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to control loading

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://be-jobfinder-final.onrender.com/getUserById?id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.errCode === 0) {
        setInputValue({
          firstName: response.data.data.firstName || "",
          lastName: response.data.data.lastName || "",
          address: response.data.data.address || "",
          phoneNumber: response.data.data.phoneNumber || "",
          email: response.data.data.email || "",
          skills: response.data.data.listSkill || [],
          gender: response.data.data.UserDetailData.genderCode || "",
          dob: response.data.data.dob || "",
          image: response.data.data.image || "",
          file: response.data.data.UserDetailData.file || "",
        });
        setOriginalUserData(response.data.data);
        const verifiedData = response.data.data;
        setVerify(verifiedData.isVerify);
        if (response.data.data.dob) {
          setDate(new Date(response.data.data.dob));
        }
      } else {
        setError(response.data.errMessage);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = Validation(inputValue);
    setErrorMessage(validationErrors);
    setIsSubmitting(true);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(
          "https://be-jobfinder-final.onrender.com/setDataUserDetail",
          {
            userId: userId,
            firstName: inputValue.firstName,
            lastName: inputValue.lastName,
            address: inputValue.address,
            phoneNumber: inputValue.phoneNumber,
            dob: inputValue.dob,
            data: {
              genderCode: inputValue.gender,
              file: inputValue.file,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.errCode === 0) {
          console.log(response.data.data);
          toast.success("Profile updated successfully!");
          setOriginalUserData(inputValue);
          setIsEditing(false);
          fetchUserData();
        } else {
          setError(response.data.errMessage || "Failed to update profile.");
          console.log("loi: " + error);
          console.log(response.data.data);
        }
      } catch (error) {
        console.error("Error updating user data:", error);
        setError("Error updating data. Please try again later.");
      } finally {
        setIsSubmitting(false); // Stop loading after the search is complete
      }
    }
  };

  const addSkill = () => {
    setInputValue((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        { skillId: Date.now(), skillData: { name: "" } },
      ],
    }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...inputValue.skills];
    newSkills[index].skillData.name = value;
    setInputValue((prev) => ({ ...prev, skills: newSkills }));
  };

  const handleInputField = (e) => {
    const { name, value } = e.target;
    setInputValue((prev) => ({ ...prev, [name]: value }));
  };

  const removeSkill = (index) => {
    const newSkills = inputValue.skills.filter((_, i) => i !== index);
    setInputValue((prev) => ({ ...prev, skills: newSkills }));
  };

  const handleCancel = () => {
    setInputValue({
      firstName: originalUserData.firstName || "",
      lastName: originalUserData.lastName || "",
      address: originalUserData.address || "",
      phoneNumber: originalUserData.phoneNumber || "",
      email: originalUserData.email || "",
      skills: originalUserData.listSkill || [],
      gender: originalUserData.UserDetailData.genderCode || "",
      dob: originalUserData.dob || "",
      image: originalUserData.image || "",
      file: originalUserData.file || "",
    });
    setIsEditing(false); // Exit editing mode
  };

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
          setInputValue({
            ...inputValue,
            file: base64, // Properly use the resolved base64 result here
          });

          console.log("file: ", file, "base64: ", base64);
        })
        .catch((error) => {
          console.error("Error converting file to base64: ", error);
        });
    } else {
      console.error("No file selected");
    }
  };

  const handleDateChange = (selectedDate) => {
    console.log("loi: " + selectedDate);
    setDate(selectedDate);
    setInputValue({ ...inputValue, dob: selectedDate });
    setErrorMessage((prevErrors) => ({ ...prevErrors, dob: "" }));
  };

  const handleSendOtp = async (email) => {
    await sendOtp(email);
    setIsDialogOpen(true);
  };

  const handleSubmitOtp = async (email, otp) => {
    const res = await verifyOtp(email, otp);
    console.log(res);
    console.log("email: " + email + " otp: " + otp.length);
    if (res.data.errCode === 0) {
      toast.success("OTP verified successfully!");
      setTimeout(async () => {
        window.location.reload();
        await fetchUserData();
        setIsCompleteOTP(true);
        setOtp("");
        setIsDialogOpen(false);
      }, 200);
    } else if (res.data.errCode === -1) {
      console.log("abc sai roi");
      setOtp("");
      toast.error("Invalid OTP");
      return;
    }
  };

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    // setNewJobLevel({ code: "", type: "JOBLEVEL", value: "" });
  };

  return (
    <>
      {loading ? (
        <GlobalLoadingMain isSubmiting={loading} />
      ) : (
        <div className="bg-white w-full rounded-lg shadow-md space-y-4 pb-4">
          <div className="flex justify-between items-center text-center ">
            <p className="font-poppins text-xl md:text-2xl font-medium p-4 ml-2 mt-2 italic">
              User Profile
            </p>
            <div className="flex justify-end gap-4 px-6">
              {!isEditing && (
                <Button
                  className="bg-secondary text-primary hover:bg-primary hover:text-secondary border-primary items-center gap-1"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
          <div className="px-6">
            <Separator />
          </div>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
                <div className="space-y-2">
                  <div className="font-medium">First Name:</div>
                  <Input
                    name="firstName"
                    placeholder="First Name"
                    className={`flex items-center rounded-sm border focus:border-primary py-4 px-4 ${
                      errorMessage.firstName && isEditing
                        ? "border-red-500"
                        : ""
                    }`}
                    onChange={handleInputField}
                    value={inputValue.firstName}
                    disabled={!isEditing}
                  />
                  {errorMessage.firstName && isEditing && (
                    <p className="text-red-500">{errorMessage.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Last Name:</label>
                  <Input
                    name="lastName"
                    placeholder="Last Name"
                    className={`flex items-center rounded-sm border focus:border-primary py-4 px-4 ${
                      errorMessage.lastName && isEditing ? "border-red-500" : ""
                    }`}
                    onChange={handleInputField}
                    value={inputValue.lastName}
                    disabled={!isEditing}
                  />
                  {errorMessage.lastName && isEditing && (
                    <p className="text-red-500">{errorMessage.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="font-medium" htmlFor="dob">
                    Date of Birth:
                  </label>
                  <div className="w-full max-w-md ">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          disabled={!isEditing}
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-full p-0">
                        <Calendar
                          className="w-full"
                          mode="single"
                          captionLayout="dropdown-buttons"
                          selected={date}
                          onSelect={handleDateChange}
                          fromYear={1964}
                          toYear={2006}
                          value={inputValue.dob}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* <div className="w-full">
                  <Input
                    type="date"
                    id="dob"
                    name="dob"
                    className="w-full px-4 py-2 rounded-sm border focus:border-primary"
                    value={inputValue.dob}
                    onChange={handleInputField}
                    disabled={!isEditing}
                  />
                </div> */}
                </div>

                <div className="space-y-2 items-center">
                  <p className="font-medium">Gender:</p>
                  <div className="flex gap-10">
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="gender"
                        id="male"
                        className="text-primary bg-primary"
                        value="M"
                        checked={inputValue.gender === "M"}
                        onChange={handleInputField}
                        disabled={!isEditing}
                      />
                      <label htmlFor="male">Male</label>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="gender"
                        id="female"
                        value="FE"
                        checked={inputValue.gender === "FE"}
                        onChange={handleInputField}
                        disabled={!isEditing}
                      />
                      <label htmlFor="female">Female</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Phone Number:</div>
                  <Input
                    name="phoneNumber"
                    placeholder="Phone Number"
                    className={`flex items-center rounded-sm border focus:border-primary py-4 px-4 ${
                      errorMessage.phoneNumber && isEditing
                        ? "border-red-500"
                        : ""
                    }`}
                    onChange={handleInputField}
                    value={inputValue.phoneNumber}
                    disabled={!isEditing}
                  />
                  {errorMessage.phoneNumber && isEditing && (
                    <p className="text-red-500">{errorMessage.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2 ">
                  <div className="font-medium">Address:</div>
                  <Input
                    name="address"
                    placeholder="Address"
                    className={`flex items-center rounded-sm border focus:border-primary py-4 px-4 ${
                      errorMessage.address && isEditing ? "border-red-500" : ""
                    }`}
                    onChange={handleInputField}
                    value={inputValue.address}
                    disabled={!isEditing}
                  />
                  {errorMessage.address && isEditing && (
                    <p className="text-red-500">{errorMessage.address}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="font-medium">Email:</div>
                  <div className="flex gap-2 items-center relative">
                    <Input
                      name="email"
                      placeholder="Email"
                      className={`flex items-center rounded-sm border focus:border-primary py-4 px-4 ${
                        errorMessage.email && isEditing ? "border-red-500" : ""
                      }`}
                      onChange={handleInputField}
                      value={inputValue.email}
                      disabled
                    />
                    {verify === 1 ? (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CheckOutlined className="absolute right-3 cursor-pointer text-success" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Email of user is verified</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      <>
                        <Popover>
                          <PopoverTrigger asChild>
                            <WarningAmberOutlined className="cursor-pointer absolute right-3 text-warning" />
                          </PopoverTrigger>
                          <PopoverContent>
                            <h1>
                              Please verify your email to access all Job Finder
                              features!
                            </h1>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() =>
                                    handleSendOtp(inputValue.email)
                                  }
                                  variant="outline"
                                >
                                  Verify Now
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Please check your email
                                  </DialogTitle>
                                  <DialogDescription>
                                    We have sent a code to {inputValue.email}
                                  </DialogDescription>
                                </DialogHeader>
                                {/* otp nè */}
                                <InputOTP
                                  value={otp}
                                  onChange={(value) => setOtp(value)}
                                  maxLength={6}
                                >
                                  <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                  </InputOTPGroup>
                                  <InputOTPSeparator />
                                  <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                  </InputOTPGroup>
                                </InputOTP>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    variant="outline"
                                    className="border-2"
                                    disabled={otp.length < 6}
                                    onClick={() =>
                                      handleSubmitOtp(inputValue.email, otp)
                                    }
                                  >
                                    Save changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  </div>
                  {errorMessage.email && isEditing && (
                    <p className="text-red-500">{errorMessage.email}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="font-medium">CV:</div>

                  <Input
                    className="rounded-sm"
                    id="picture"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e)}
                    disabled={!isEditing}
                  />
                  <iframe
                    width={"100%"}
                    height={"700px"}
                    src={inputValue.file}
                  ></iframe>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8 mr-6">
                {isEditing && (
                  <div className="flex gap-4">
                    <Button
                      className="bg-secondary text-primary hover:bg-primary hover:text-secondary border-primary items-center gap-1"
                      variant="outline"
                      onClick={() => {
                        handleCancel();
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-secondary text-primary hover:bg-primary hover:text-secondary border-primary items-center gap-1"
                      variant="outline"
                      type="submit"
                    >
                      <SaveOutlinedIcon />
                      Save
                    </Button>
                  </div>
                )}
              </div>
              <GlobalLoadingMain isSubmiting={loading} />
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default PersonalInformation;
