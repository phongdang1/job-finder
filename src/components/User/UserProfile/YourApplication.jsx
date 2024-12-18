import React, { useEffect, useState } from "react";
import axios from "../../../fetchData/axios";
import { getCvByUserId } from "../../../fetchData/CvPost";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";

const YourApplication = () => {
  const userId = localStorage.getItem("user_id");
  const [user, setUser] = useState();
  const [cvData, setCvData] = useState([]);
  const [countJob, setCountJob] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/getUserById?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const cvResponse = await getCvByUserId(userId);
      if (response.data.errCode === 0 && cvResponse.data.errCode === 0) {
        setUser(response.data.data);
        setCvData(cvResponse.data.data);
        setCountJob(response.data.count);
      } else {
        console.error("Error fetching CV data:", cvResponse);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <GlobalLoadingMain isSubmiting={loading} />
      ) : (
        <div className="w-full flex flex-col gap-y-4">
          <div className="bg-white h-fit p-4">
            <p className="font-poppins text-xl md:text-2xl font-medium italic mb-4">
              {cvData && cvData.length > 0
                ? "You can see all the jobs you have applied here"
                : "You have not applied for any jobs"}
            </p>

            <div className="space-y-4 ">
              {cvData.map((cv, index) => (
                <Card
                  key={index}
                  className="flex flex-col md:flex-row items-center p-6 border border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:border-primary hover:bg-primary/10 transition bg-white  group hover:outline-2 hover:outline-primary "
                >
                  <div className="flex-1 ">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {cv.postCvData?.postDetailData?.name || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-400 ">
                        {cv.description || "No description provided."}
                      </p>
                      <p className="text-xs text-gray-500 my-3">
                        Applied on:{" "}
                        <span className="font-semibold text-primary">
                          {new Date(cv.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>

                    <div className="text-sm text-gray-600 mt-1 flex gap-3">
                      <Badge
                        variant="outline"
                        className="bg-white w-fit text-nowrap rounded-lg hover:bg-primary/20"
                      >
                        {cv.postCvData?.postDetailData?.jobLevelPostData
                          ?.value || "N/A"}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="bg-white w-fit text-nowrap rounded-lg hover:bg-primary/20"
                      >
                        {cv.postCvData?.postDetailData?.provincePostData
                          ?.value || "N/A"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-white w-fit text-nowrap rounded-lg hover:bg-primary/20"
                      >
                        {cv.postCvData?.postDetailData?.salaryTypePostData
                          ?.value || "Negotiable"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end md:text-right justify-between">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                        cv.statusCode === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : cv.statusCode === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : cv.statusCode === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-300 text-blue-800"
                      }`}
                    >
                      {cv.statusCode}
                    </span>
                    <Link to={`/job-detail/${cv.postId}`}>
                      <Button
                        variant="outline"
                        className="mt-2 border border-primary text-primary font-semibold hover:text-white hover:bg-primary"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YourApplication;
