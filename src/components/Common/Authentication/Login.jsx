// src/components/Login.js

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Typewriter from "typewriter-effect";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { IoMdLock, IoMdCall, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdAlternateEmail } from "react-icons/md";
import { Button } from "@/components/ui/button";
import IconGoogle from "../../../assets/svgicon/icons8-google.svg";
import IconFacebook from "../../../assets/svgicon/icons8-facebook.svg";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../../assets/css/login.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, setToken, setUser } from "../../../redux/features/authSlice";
import axios from "../../../fetchData/axios";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"; // Import OTP functions from Firebase
import firebase from "../../../utils/firebase";
import Validation from "@/components/User/Common/Validation";
const Login = () => {
  // xử lý show/hidden password
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null); // To store OTP verification result
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Xử lý login bằng redux
  const authStatus = useSelector((state) => state.auth.status);
  const authToken = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const error = useSelector((state) => state.auth.error);

  // Xử lý login thông thường

  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   try{
  //      // Kiểm tra và khởi tạo reCAPTCHA nếu chưa có
  //   if (!window.recaptchaVerifier) {

  //     window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
  //       "recaptcha-container",
  //       {
  //         size: "invisible", // hoặc 'normal' nếu muốn hiển thị
  //         callback: (response) => {
  //           console.log("reCAPTCHA solved, can proceed with OTP sending.");
  //           sendOtp();
  //         },
  //         'expired-callback': () => {
  //           console.error('reCAPTCHA expired. Please solve the CAPTCHA again.');
  //         }
  //       }
  //     );
  //   }
  //    await sendOtp();
  //   } catch (error) {
  //     console.error("Error during OTP sending:", error.message);
  //   }
  // };

  // const formatPhoneNumber = (phoneNumber) => {
  //   // Thêm mã quốc gia +84 và bỏ số 0 đầu tiên nếu cần
  //   if (phoneNumber.startsWith("0")) {
  //     return "+84" + phoneNumber.slice(1);
  //   }
  //   return phoneNumber;
  // };

  // const sendOtp = async() => {
  //   const appVerify = window.recaptchaVerifier;
  //   const formattedPhoneNumber = formatPhoneNumber(phoneNumber); // Format số điện thoại
  //   await firebase.auth().signInWithPhoneNumber(formattedPhoneNumber, appVerify)
  //     .then((confirmationResult) => {
  //       console.log("sdt", formattedPhoneNumber);
  //       // Store confirmation result globally
  //       window.confirmationResult = confirmationResult; // Save OTP verification result globally
  //       console.log('gui otp thanh cong')
  //       localStorage.setItem("phoneNumber", formattedPhoneNumber);

  //     })
  //     .catch((error) => {
  //       if (error.code === "auth/invalid-app-credential") {
  //         console.error("reCAPTCHA token expired or invalid. Please reload reCAPTCHA.");
  //         window.recaptchaVerifier.clear(); // Xóa reCAPTCHA khi gặp lỗi
  //         window.recaptchaVerifier = null; // Tái khởi tạo reCAPTCHA khi gặp lỗi
  //       }
  //       console.error("Failed to send OTP:", error.message);
  //     });
  // };

  // const handleVerifyOTP = () => {
  //   window.confirmationResult.confirm(otp)
  //   .then(() => {
  //     console.log("xac thuc thanh cong")
  //     navigate("/");
  //   })
  //   .catch((error) =>{
  //     console.log("xac thuc that bai")

  //   })

  // }

  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const credentials = {
      email: email,
      password: password,
    };
    try {
      const result = await dispatch(login(credentials)).unwrap();

      console.log(result.errCode != 0);

      if (result.errCode != 0) {
        console.log(result.errCode);
        setErr(result.errMessage);
        console.log("errmess", result.errMessage);
      } else {
        if (result.user.roleCode === "COMPANY") {
          localStorage.setItem("email", email);
          localStorage.setItem("user_id", result.user?.id);
          localStorage.setItem("roleCode", result.user?.roleCode);
          localStorage.setItem("companyId", result.user?.companyId);
          localStorage.setItem("token", result.token);
          navigate("/company/dashboard");
        } else if (result.user.roleCode === "ADMIN") {
          localStorage.setItem("email", email);
          localStorage.setItem("user_id", result.user?.id);
          localStorage.setItem("roleCode", result.user?.roleCode);
          localStorage.setItem("token", result.token);
          navigate("/admin/dashboard");
        } else {
          localStorage.setItem("email", email);
          localStorage.setItem("user_id", result.user?.id);
          localStorage.setItem("roleCode", result.user?.roleCode);
          localStorage.setItem("token", result.token);
          fetchUser(result.user?.id);
          navigate("/");
        }
      }
    } catch (error) {
      console.log("Failed to login: ", error.message || error);
    }
  };
  // useEffect(() => {
  //   const userId = localStorage.getItem("user_id");
  //   console.log("User ID retrieved from URL:", userId);
  // }, [dispatch, navigate]);

  const fetchUser = async (userId) => {
    try {
      const response = await axios.get(`/getUserById?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });
      
      console.log("Response from /getUserById:", response);

      if (response.data) {
        dispatch(setUser(response.data)); // Cập nhật thông tin người dùng vào Redux store
        localStorage.setItem("user", JSON.stringify(response.data)); // Lưu thông tin người dùng vào localStorage
        console.log("User data set in Redux and localStorage:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };
  const fetchGoogle = async() => {
    const responseGoogle = await axios.get(
      "https://be-jobfinder-final.onrender.com/auth/google/callback",
      {
        withCredentials: true, // Để gửi cookie session
      }
    );
    console.log("response google ne", responseGoogle);
    if (responseGoogle.status === 200) {
      // window.location.href = "/";
      // const userData = response.data.user;
      // dispatch(setUser(userData));

      // // Lưu user vào localStorage
      localStorage.setItem("user_id", JSON.stringify(responseGoogle.userId));
      localStorage.setItem("token", JSON.stringify(responseGoogle.token));
      // Chuyển hướng về trang Home
      navigate("/");
    } else {
      console.error("Authentication failed");
    }
  }

  useEffect(() => {
    fetchGoogle();
  },[navigate])

  // Function to handle Google login using the googleLogin thunk
  const handleGoogleLogin = async () => {
    // Dispatch Google login action
    window.open("https://be-jobfinder-final.onrender.com/auth/google", "_self");
  };

  //Validation

  const [errorMessage, setErrorMessage] = useState("");

  const handleValidation = (e) => {
    const { name, value } = e.target;
    const errors = Validation({ [name]: value });
    setErrorMessage((prev) => ({ ...prev, [name]: errors[name] || "" }));
  };

  return (
    <div className="m-auto height-[100vh] flex flex-row px-12 py-24 mx-auto">
      {/* Recaptcha container */}
      <div id="recaptcha-container"></div>
      {/* Left side */}
      <div className="flex-1 mb-[56px] w-[548px] text-third lg:flex hidden flex-col items-center justify-center">
        <div className="text-3xl font-title font-bold mb-4">Job Finder</div>
        <Typewriter
          options={{
            strings: [
              "Explore endless opportunities and unlock your true potential—where your career aspirations come to life",
            ],
            autoStart: true,
            loop: true,
            delay: 75, // Thay đổi độ trễ nếu cần
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex-1  px-12 py-14 mx-auto border shadow-lg max-w-[800px] bg-white flex flex-col items-center justify-center">
        <form className="w-full" onSubmit={handleLogin}>
          <h1 className="mb-8 text-5xl text-primary  font-title">Sign in</h1>
          <div className="mb-6">
            <div
              className="flex flex-row justify-between items-center mb-2"
              htmlFor="email"
            >
              <label className="text-gray-700 text-sm font-bold"> Email</label>
              <div className="flex items-center text-[13px] gap-x-2">
                <p>Need an account ?</p>
                <Link
                  className="text-[13px]  text-primary font-medium"
                  to="/signup"
                >
                  Sign up
                </Link>
              </div>
            </div>
            <div className="relative flex items-center">
              <MdAlternateEmail className="text-gray-500 mr-2 absolute left-3" />
              <Input
                name="email"
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleValidation(e);
                }}
                className={`flex items-center border ${
                  errorMessage.phoneNumber
                    ? "border-red-500"
                    : "focus:border-primary"
                } py-7 px-10`}
              />
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-gray-700 text-sm font-bold"
                htmlFor="password"
              >
                Password
              </label>
              <button
                type="button"
                onClick={toggleShowPassword}
                className="text-blue-500 flex items-center space-x-2"
              >
                {showPassword ? (
                  <>
                    <IoMdEyeOff className="text-gray-500" />
                    <span className="text-sm">Hide</span>
                  </>
                ) : (
                  <>
                    <IoMdEye className="text-gray-500" />
                    <span className="text-sm">Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative flex items-center">
              <IoMdLock className="text-gray-500 mr-2 absolute left-3" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className={`${
                  errorMessage.password ? "border-red-500" : null
                } flex items-center border focus:border-primary py-7 px-10`}
              />
            </div>
            <p className="text-red-500 mt-2">{err}</p>
            {/* otp */}
            {/* <div className="relative flex items-center">
              <IoMdCall className="text-gray-500 mr-2 absolute left-3" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="flex items-center border focus:border-primary py-7 px-10"
              />
              <button onClick={handleVerifyOTP}>
                Verify OTP
              </button>
            </div> */}
          </div>
          <div className="my-7 flex items-center justify-center ">
            <Button
              type="submit"
              className="text-white rounded-full w-full py-5 px-7 transition  transform hover:scale-105"
            >
              Login now
            </Button>
          </div>

          <div className="mb-4 flex items-center">
            <hr className="flex-1 border-t border-gray-300" />
            <span className="mx-4 font-bold">Login with other</span>
            <hr className="flex-1 border-t border-gray-300" />
          </div>
          <div className="flex flex-row sm:flex-col justify-center gap-x-10 gap-y-3 xl:gap-x-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center px-3 py-3  rounded-full border-2 border-slate-300 hover:bg-slate-200"
            >
              <img src={IconGoogle} className="w-6 m-2" alt="" />
              <p className="hidden sm:block">Login with Google</p>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
