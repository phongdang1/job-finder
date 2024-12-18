import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaLightbulb, FaEnvelope, FaFileAlt } from "react-icons/fa";
import { BsSuitcaseLgFill } from "react-icons/bs";
import image from "../../assets/illustration/home/blueberry-digital-banking-and-online-currency-exchange.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPaymentViewCv, createPaymentVip } from "@/fetchData/Transaction";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";
import { getUsersById } from "@/fetchData/User";
import GlobalLoadingSmall from "@/components/GlobalLoading/GlobalLoadingSmall";

const VipFeature = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
  useEffect(() => {
    // Cuộn lên đầu trang khi component được render
    window.scrollTo(0, 0);
  }, []);
  const [user, setUser] = useState();

  const userId = localStorage.getItem("user_id");
  const [loading, setLoading] = useState(false); // Đặt initial loading là false
  const [loadingButton, setLoadingButton] = useState(false);
  console.log("userid:", user?.data?.isVip);

  const handleUpdateVip = async () => {
    // Bắt đầu loading
    setLoading(true);

    try {
      const res = await createPaymentVip(7);
      console.log("vip:", res);
      if (res.data.errCode == 0) {
        let data = {
          packageId: 7,
          amount: 1,
          userId: JSON.parse(localStorage.getItem("user_id")),
        };
        localStorage.setItem("orderData", JSON.stringify(data));
        const redirectUrl = `${res.data.link}`;
        console.log("Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      } else {
        console.log("loi thanh toan", res);
      }
    } catch (error) {
      console.error("Error during payment:", error);
    } finally {
      // Kết thúc loading
      setLoading(false);
    }
  };
  const fetchUser = async (userId) => {
    setLoadingButton(true);
    try {
      const response = await getUsersById(userId);
      if (response.data) {
        setUser(response.data);
        console.log("vip dmm", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoadingButton(false);
    }
  };

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  return (
    <div className="container mx-auto my-20">
      {/* Hiển thị loading khi đang tải */}
      {loading && <GlobalLoadingMain isSubmiting={loading} />}

      {/* Banner Section */}
      <div className="w-full flex text-white justify-around" data-aos="fade-up">
        {/* text */}
        <div className="w-1/2">
          <h1 className="text-4xl text-third font-bold  ">
            Elevate Your Career with VIP Access
          </h1>
          <p className="mt-4 text-lg text-gray-600 ">
            Become a VIP and enjoy personalized job alerts, featured profile
            placement, and access to premium job listings that are not available
            to regular users.
          </p>
          <div className="text-3xl font-bold  bg-gradient-to-r from-[#4a3d8d]/80 to-primary/90 bg-clip-text text-transparent p-2 rounded-lg">
            30$
          </div>
          {loadingButton ? (
            <GlobalLoadingSmall isSubmiting={loadingButton} />
          ) : (
            <Button
              onClick={handleUpdateVip}
              disabled={user?.data?.isVip === 1 || user?.errCode !== 0}
              className="mt-4 py-8 px-5 rounded-2xl bg-white border border-primary hover:bg-primary hover:text-white shadow-sm shadow-primary"
            >
              {user?.errCode !== 0
                ? "You are not logged in !"
                : user?.data?.isVip === 1
                ? "You are already VIP member !"
                : "Upgrade Now"}
            </Button>
          )}
        </div>
        {/* image */}
        <div>
          <img src={image} />
        </div>
      </div>

      {/* VIP Package Cards Section */}
      <div className="my-2">
        <h1 className="my-10 text-4xl font-semibold  text-center">
          Our <span className="text-primary ">Features</span>
        </h1>
        <p className="text-xl font-medium text-center my-10">
          Enjoy a seamless job search experience with these features
        </p>
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          data-aos="fade-up"
        >
          <Card className="flex flex-col  items-center text-center p-4">
            <CardHeader className="flex justify-center items-center">
              <FaLightbulb className="text-4xl text-primary mb-4" />
              <CardTitle>Job Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Receive tailored job suggestions based on your skills and
                preferences.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="flex flex-col items-center text-center p-4">
            <CardHeader className="flex justify-center items-center">
              <FaEnvelope className="text-4xl text-primary mb-4" />
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Get instant email alerts for new job openings in your field.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="flex flex-col items-center text-center p-4">
            <CardHeader className="flex justify-center items-center">
              <BsSuitcaseLgFill className="text-4xl text-primary mb-4" />
              <CardTitle>Job Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Easily compare job offers to find the best match for your career
                goals.
              </p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="flex flex-col items-center text-center p-4">
            <CardHeader className="flex justify-center items-center">
              <FaFileAlt className="text-4xl text-primary mb-4" />
              <CardTitle>&quot;Job Seeker&quot; mode </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Enable this amazing feature to increase your chances of getting
                hired.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VipFeature;
