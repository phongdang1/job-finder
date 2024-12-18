import JobCard from "./Common/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Pagination, Button } from "@nextui-org/react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Cached,
  NavigateBefore,
  NavigateNext,
  Replay,
} from "@mui/icons-material";
import {
  getAllCode,
  getAllCodeByType,
  getValueByCode,
} from "@/fetchData/AllCode";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllPost,
  getAllPostsInactive,
  getAllPostWithLimit,
} from "@/fetchData/Post";
import JobPagination from "../Jobpage/JobPagination";

function BestJob() {
  const [sort, setSort] = useState([]);
  const [sortValue, setSortValue] = useState([]);
  const [selectedType, setSelectedType] = useState("PROVINCE");
  const [isLoading, setIsLoading] = useState(true);
  const [select, setSelect] = useState();

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const loadPosition = document.documentElement.scrollHeight - 2300;
    if (scrollPosition >= loadPosition) {
      setIsLoading(false);
    }
  };

  const fetchSort = async () => {
    try {
      const response = await getAllCode();
      const jobData = response.data.data;
      setSort(jobData);
      console.log("Job data", jobData);

      if (selectedType) {
        const response2 = await getAllCodeByType(selectedType);
        setSortValue(response2.data.data);
        console.log("aaaaaaaa", response2.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    if (!isLoading) {
      fetchSort();
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedType, isLoading]);

  const requiredTypes = [
    "SALARYTYPE",
    "EXPIERNCETYPE",
    "PROVINCE",
    "JOBTYPE",
    "WORKTYPE",
    "JOBLEVEL",
  ];
  const uniqueTypes = [...new Set(sort.map((item) => item.type))];

  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [currentJobs, setCurrentJobs] = useState([]);
  const itemsPerPage = 9;
  const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);

  const fetchAllPosts = async () => {
    const date = new Date();
    try {
      const response = await getAllPost();
      const fetchedData = response.data.data;
      const allHotJobs = fetchedData.filter(
        (all) =>
          all.isHot === 1 &&
          date < new Date(all.timeEnd) &&
          all.statusCode === "APPROVED"
      );

      if (allHotJobs) {
        setData(allHotJobs);
        setTotalPages(Math.ceil(allHotJobs.length / itemsPerPage));
        setCurrentJobs(allHotJobs.slice(0, itemsPerPage)); // Default to first page
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    const jobsToPaginate = sortedData.length > 0 ? sortedData : data;
    const indexOfLastJob = page * itemsPerPage;
    const indexOfFirstJob = indexOfLastJob - itemsPerPage;

    setCurrentJobs(jobsToPaginate.slice(indexOfFirstJob, indexOfLastJob));
  };

  useEffect(() => {
    const jobsToPaginate = sortedData.length > 0 ? sortedData : data;
    const indexOfLastJob = currentPage * itemsPerPage;
    const indexOfFirstJob = indexOfLastJob - itemsPerPage;

    setCurrentJobs(jobsToPaginate.slice(indexOfFirstJob, indexOfLastJob));
  }, [currentPage, sortedData, data]);

  const handleSortByValue = async (code, index) => {
    const date = new Date();
    try {
      const response = await getAllPostsInactive(code);
      const fetchedData = response.data.data;
      console.log("asdasd", fetchedData);

      const allHotJobs = fetchedData.filter(
        (all) => all.isHot === 1 && date < new Date(all.timeEnd)
      );

      if (allHotJobs.length > 0) {
        setSortedData(allHotJobs); // Update sorted data
        setSelect(index);
        setCurrentPage(1); // Reset to the first page of sorted data
        setTotalPages(Math.ceil(allHotJobs.length / itemsPerPage));
        setCurrentJobs(allHotJobs.slice(0, itemsPerPage)); // Show the first page
      } else {
        setSortedData([]);
        setSelect(index);
        setCurrentJobs([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching sorted jobs:", error);
    }
  };

  const handleReset = () => {
    setSortedData([]);
    setCurrentJobs([]);
    setTotalPages(0);
    setCurrentPage(1);
    setSelect("");
    fetchAllPosts();
  };

  const [autoPaginate, setAutoPaginate] = useState(null);
  useEffect(() => {
    if (totalPages > 0) {
      const interval = setInterval(() => {
        setCurrentPage((prevPage) => {
          const nextPage = prevPage < totalPages ? prevPage + 1 : 1;
          handlePageChange(nextPage);
          return nextPage;
        });
      }, 30000);

      setAutoPaginate(interval);

      return () => clearInterval(interval);
    }
  }, [totalPages, data, sortedData]);

  return (
    <div className="flex flex-col bg-white pb-8 mb-24 mt-10 mx-10 sm:mx-12 md:mx-16 xl:mx-36 font-poppins rounded-lg border-[1px] border-primary">
      <div className="flex items-center justify-between text-4xl md:text-5xl font-forum mb-4 font-semibold text-start bg-[#4a3d8d] bg-opacity-70 rounded-t-lg p-6">
        <div>
          Best <span className="text-secondary">Job</span> For You
        </div>
        <div className="text-secondary text-base font-poppins font-light mr-4 hover:underline hover:underline-offset-1">
          <Link to="/jobs">See All Jobs </Link>
        </div>
      </div>
      {/* Sort and carousel */}
      <div className="flex flex-col xl:flex-row justify-center xl:justify-between items-center w-full mx-4 space-y-4 xl:space-y-0 mt-4">
        <div className="flex justify-around xl:justify-start gap-x-4 w-full">
          <Select
            className="flex items-center "
            onValueChange={(type) => setSelectedType(type)}
          >
            <SelectTrigger className="w-4/5 sm:w-4/5 md:w-4/5 xl:w-[200px] shrink basis-1/4">
              <FilterListIcon className="" />
              <SelectValue placeholder="Sort by" value={selectedType} />
            </SelectTrigger>
            <SelectContent>
              {uniqueTypes
                .filter((type) => requiredTypes.includes(type))
                .map((type, index) => (
                  <SelectItem key={index} value={type}>
                    {type}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="bg-white text-primary border border-primary hover:bg-primary hover:text-white group"
            onClick={() => handleReset()}
          >
            <Cached className="group-hover:animate-spin" />
            <p>Reset</p>
          </Button>
        </div>

        <div className="w-[95%] basis-1/2 px-20 flex-shrink">
          <Carousel className="w-[96%] xl:w-[600px]">
            <CarouselContent className="flex">
              {sortValue.map((value, index) => (
                <CarouselItem key={index} className="basis-1/3 items-center">
                  <Card
                    onClick={() =>
                      handleSortByValue(value.code, index, currentPage)
                    }
                    className={`h-10 text-center text-black rounded-3xl cursor-pointer hover:bg-primary hover:text-white flex justify-center ${
                      select === index ? "bg-primary text-white" : ""
                    } `}
                  >
                    <button type="button" className="text-xs font-medium">
                      {value.value}
                    </button>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-2 border-primary text-primary bg-white hover:text-white hover:bg-primary" />
            <CarouselNext className="border-2 border-primary text-primary bg-white hover:text-white hover:bg-primary" />
          </Carousel>
        </div>
      </div>
      {/* Job cards */}
      <div className="w-full grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 py-10 px-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center md:items-start"
            >
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-3/4 sm:w-[250px] lg:w-[300px]" />
                <Skeleton className="h-4 w-1/2 sm:w-[200px] lg:w-[250px]" />
              </div>
            </div>
          ))
        ) : currentJobs && currentJobs.length > 0 && totalPages > 0 ? (
          <JobCard expand="" data={currentJobs} />
        ) : (
          <>
            <div></div>
            <div className="w-full flex justify-center items-center text-center text-gray-500">
              <p>No jobs available</p>
            </div>
          </>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 0 ? (
        <JobPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default BestJob;
