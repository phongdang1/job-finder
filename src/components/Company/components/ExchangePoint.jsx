import React, { useEffect, useState } from "react";
import "aos/dist/aos.css";
import AOS from "aos";
import { FaGift } from "react-icons/fa"; // icon for illustration
import { Button } from "@/components/ui/button";
import {
  exchangePointToPost,
  exchangePointToView,
  getCompanyById,
} from "@/fetchData/Company";
import { getUsersById } from "@/fetchData/User";
import Lottie from "lottie-react";
import giftAnimation from "../../../assets/animation/giftAnimation.json";
import discountAnimation from "../../../assets/animation/discountAnimation.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";
import GlobalLoadingSmall from "@/components/GlobalLoading/GlobalLoadingSmall";
const giftPackages = [
  { id: 1, name: "10 Featured Posts", points: 500, value: 10, plan: "post" },
  { id: 2, name: "25 Featured Posts", points: 900, value: 25, plan: "post" },
  { id: 3, name: "30 Featured Posts", points: 1000, value: 30, plan: "post" },
  { id: 4, name: "5 View CV", points: 300, value: 5, plan: "view" },
  { id: 5, name: "10 View CV", points: 550, value: 10, plan: "view" },
  { id: 6, name: "20 View CV", points: 1200, value: 20, plan: "view" },
];

const companyId = localStorage.getItem("companyId");
const userId = localStorage.getItem("user_id");

const ExchangePoint = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [hoveredButtonId, setHoveredButtonId] = useState(null);
  const [company, setCompany] = useState();
  const [user, setUser] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchCompany = async () => {
    setIsLoading(true);
    const res = await getCompanyById(companyId);
    const resUser = await getUsersById(userId);
    if (res && resUser) {
      console.log("company" + res.data.data + "user " + resUser.data.data);
      setCompany(res.data.data);
      setUser(resUser.data.data);
    } else {
      console.log("Error fetching company", res);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchCompany();
  }, []);
  const handleExchangePointToView = async () => {
    setIsSubmiting(true); // Bắt đầu loading
    try {
      const res = await exchangePointToView({
        userId: userId,
        point: selectedPackage.points,
        value: selectedPackage.value,
      });
      if (res.data.errCode === 0) {
        toast.success("Exchange successfully!");
        fetchCompany();
        setIsOpen(false);
      } else {
        toast.error(res.data.errMessage);
      }
    } catch (error) {
      console.error("Error exchanging points for view:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmiting(false); // Kết thúc loading
    }
  };

  const handleExchangePointToPost = async () => {
    setIsSubmiting(true); // Bắt đầu hiển thị GlobalLoading
    try {
      const res = await exchangePointToPost({
        userId: userId,
        point: selectedPackage.points,
        value: selectedPackage.value,
      });
      if (res.data.errCode === 0) {
        toast.success("Exchange successfully!");
        fetchCompany();
        setIsOpen(false);
      } else {
        toast.error(res.data.errMessage);
      }
    } catch (error) {
      console.error("Error exchanging points:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmiting(false); // Tắt GlobalLoading sau khi xử lý
    }
  };

  return (
    <div className="my-20 px-4 sm:px-6 lg:px-8 relative">
      <Link
        to="/company/product"
        className="z-20 absolute -top-14 flex items-center justify-center gap-1 font-semibold hover:text-primary transition"
      >
        <IoIosArrowBack />
        Return to Product page
      </Link>
      {/* Title */}
      <div data-aos="fade-up" className="text-center flex flex-col gap-3">
        <h1 className="font-roboto text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800">
          Point Store
        </h1>
        <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
          Earn points from purchasing our packages and use them to exchange for
          gifts!
        </p>
        <Lottie
          data-aos="fade-up"
          className="absolute -top-32 -left-48 xl:-left-20 hidden md:block z-10 w-[300px] h-[300px]"
          animationData={giftAnimation}
          loop={true}
        />
        <Lottie
          data-aos="fade-up"
          className="absolute -top-10 -right-48 xl:-right-20 hidden md:block z-50 w-[130px] h-[130px]"
          animationData={discountAnimation}
          loop={true}
        />
        {/* points */}
        <div
          data-aos="fade-up"
          className="flex gap-2 font-semibold text-lg sm:text-2xl py-6 sm:py-10 items-center justify-center"
        >
          <h1>Your Points:</h1>
          {isLoading ? (
            <GlobalLoadingSmall className="right-64" isSubmiting={true} />
          ) : (
            <span className="text-primary">{user?.point}</span>
          )}
        </div>

        {/* post */}
        <div
          data-aos="fade-up"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <div className="bg-white rounded-md flex flex-col gap-2 font-semibold text-lg sm:text-xl p-4 sm:p-4 items-center justify-center border-2 border-primary shadow-lg min-h-[150px] sm:min-h-[200px] max-w-full w-[500px] sm:max-w-[500px]">
            {isLoading ? (
              <GlobalLoadingSmall className="top-1" isSubmiting={true} />
            ) : (
              <span className="text-primary">{company?.allowHotPost}</span>
            )}

            <h1>Hot Posts remaining</h1>
          </div>
          {/* cv */}
          <div className="bg-white rounded-md flex flex-col gap-2 font-semibold text-lg sm:text-xl p-8 sm:p-4 items-center justify-center border-2 border-primary shadow-lg min-h-[150px] sm:min-h-[200px] max-w-full w-[500px] sm:max-w-[500px]">
            {isLoading ? (
              <GlobalLoadingSmall className="top-1" isSubmiting={true} />
            ) : (
              <span className="text-primary">{company?.allowCv}</span>
            )}

            <h1>View CV remaining</h1>
          </div>
        </div>

        {/* Gift */}
        <div
          data-aos="fade-up"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-md"
        >
          {giftPackages.map((pkg) => (
            <div
              key={pkg.id}
              data-aos="fade-up"
              className="flex flex-col sm:flex-row items-center px-4 justify-between py-6 bg-white border border-gray-200 shadow-md rounded-lg transition transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-3 mb-4 sm:mb-0">
                <FaGift className="text-3xl sm:text-4xl text-primary" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  {pkg.name}
                </h2>
              </div>

              <Button
                onMouseEnter={() => setHoveredButtonId(pkg.id)}
                onMouseLeave={() => setHoveredButtonId(null)}
                onClick={() => {
                  setSelectedPackage(pkg);
                  setIsOpen(true);
                }}
                className="py-2 px-4 sm:px-6 bg-white text-primary hover:text-white border border-primary font-semibold rounded-lg hover:bg-primary"
              >
                <span className="font-semibold">
                  {hoveredButtonId === pkg.id
                    ? "Exchange"
                    : `${pkg.points} Points`}
                </span>
              </Button>
              <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Exchange {selectedPackage?.name}</DialogTitle>
                    <DialogDescription>
                      Are you sure using {selectedPackage?.points} points to
                      exchange this package ?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (selectedPackage?.plan == "post") {
                          handleExchangePointToPost();
                        } else {
                          handleExchangePointToView();
                        }
                      }}
                      className="py-2 px-4 sm:px-6 bg-white text-primary hover:text-white border border-primary font-semibold rounded-lg hover:bg-primary"
                    >
                      Exchange
                    </Button>
                    <GlobalLoadingMain isSubmiting={isSubmiting} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExchangePoint;
