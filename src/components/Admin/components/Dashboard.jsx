import React, { useState, useEffect } from "react";

import CardDashboard from "./CardDashboard"; // Import component StatisticsCard
import { FaUsers, FaBuilding, FaBriefcase, FaHistory } from "react-icons/fa"; // Các biểu tượng ví dụ
import { Typography } from "@mui/material";

import Chart from "./Chart";
import { Component } from "./Component";
import { LineChartLabel } from "./LineChart";
import { TableDemo } from "./Table";
// import { Component } from "./Component";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";
import { getAllPost } from "../../../fetchData/Post";
import { getAllCodeByType } from "../../../fetchData/AllCode";

const Dashboard = () => {
  const [jobTypeData, setJobTypeData] = useState([]);
  const [postData, setPostData] = useState([]);
  const [topJobTypes, setTopJobTypes] = useState([]);
  const [otherPostsCount, setOtherPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch job types and posts
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobTypeResponse, postResponse] = await Promise.all([
          getAllCodeByType("JOBTYPE"),
          getAllPost(),
        ]);

        if (jobTypeResponse.data.errCode === 0) {
          setJobTypeData(jobTypeResponse.data.data);
        }
        if (postResponse.data.errCode === 0) {
          setPostData(postResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (jobTypeData.length > 0 && postData.length > 0) {
      // Calculate the count of posts for each job type
      const jobTypeCounts = jobTypeData.reduce((acc, jobType) => {
        acc[jobType.code] = postData.filter(
          (post) => post.postDetailData?.jobTypePostData?.code === jobType.code
        ).length;
        return acc;
      }, {});

      // Sort job types by count and get the top 3
      const sortedJobTypes = Object.entries(jobTypeCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3);

      setTopJobTypes(
        sortedJobTypes.map(([code]) => ({
          ...jobTypeData.find((jobType) => jobType.code === code),
          count: jobTypeCounts[code],
        }))
      );

      // Calculate the count of posts in other job types
      const topJobTypeCodes = sortedJobTypes.map(([code]) => code);
      const otherCount = postData.filter(
        (post) =>
          !topJobTypeCodes.includes(post.postDetailData?.jobTypePostData?.code)
      ).length;

      setOtherPostsCount(otherCount);
    }
  }, [jobTypeData, postData]);

  if (loading) return <GlobalLoadingMain isSubmiting={true} />;
  if (error) return <p>{error}</p>;
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {topJobTypes.map((jobType, index) => (
          <CardDashboard
            key={jobType.code}
            icon={React.createElement(
              [FaUsers, FaBuilding, FaBriefcase][index] || FaHistory,
              { className: "w-6 h-6" }
            )}
            title={jobType.value}
            value={`${jobType.count} Post`}
          />
        ))}
        <CardDashboard
          icon={<FaHistory className="w-6 h-6" />}
          title="Other fields"
          value={`${otherPostsCount} Post`}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 w-full">
          <Component />
          <Chart />
          <LineChartLabel />
        </div>
        <div className="text-xl font-bold pl-1">
          <p>Revenue statistics table</p>
        </div>
        <div className="flex flex-row gap-4 w-full">
          <TableDemo />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
