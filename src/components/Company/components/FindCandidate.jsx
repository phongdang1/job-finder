import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import { getAllCodeByType } from "@/fetchData/AllCode";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CloseOutlined } from "@mui/icons-material";
import { getAllSkillByCategory } from "@/fetchData/Skill";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import CandidateCard from "./CandidateCard";
import { handleFindCv } from "@/fetchData/CvPost";
import { getCompanyById } from "@/fetchData/Company";
import axios from "../../../fetchData/axios";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";

const FindCandidate = () => {
  const [dreamJob, setDreamJob] = useState({
    province: "",
    jobType: "",
    jobLevel: "",
    salary: "",
    workType: "",
    exp: "",
    genderPost: "",
    // skill: [],
  });
  const [province, setProvince] = useState([]);
  const [jobType, setJobType] = useState([]);
  const [jobLevel, setJobLevel] = useState([]);
  const [salary, setSalary] = useState([]);
  const [workType, setWorkType] = useState([]);
  const [exp, setExp] = useState([]);
  const [genderPost, setGenderPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  const typeKey = [
    "PROVINCE",
    "JOBTYPE",
    "JOBLEVEL",
    "SALARYTYPE",
    "WORKTYPE",
    "EXPTYPE",
    "GENDEr",
  ];
  useEffect(() => {
    const fetchJobType = async () => {
      try {
        const response = typeKey.map((type) => getAllCodeByType(type));

        const results = await Promise.all(response);
        // put res in array of all results in Promise

        setProvince(results[0]?.data.data || []);
        setJobType(results[1]?.data.data || []);
        setJobLevel(results[2]?.data.data || []);
        setSalary(results[3]?.data.data || []);
        setWorkType(results[4]?.data.data || []);
        setExp(results[5]?.data.data || []);
        setGenderPost(results[6]?.data.data || []);

        // console.log(JSON.stringify(results[3], null, 2));
      } catch (error) {
        console.log("Error fetching job types");
      }
    };
    fetchJobType();
  }, [type]);

  const [cateJobCode, setCateJobCode] = useState("");
  const [data, setData] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getAllCodeByType("JOBTYPE");
        setData(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.log("Error fetching job categories");
      }
    };

    fetchCategory();
  }, []);

  const fetchSkill = async () => {
    if (cateJobCode) {
      try {
        const response = await getAllSkillByCategory(cateJobCode);
        const fetchedSkills = response.data.data;
        const filteredSkills = fetchedSkills.filter(
          (skill) => !selectedSkills.some((s) => s.id === skill.id)
        );

        setSuggestedSkills(filteredSkills);
        console.log(response.data.data);
      } catch (error) {
        console.log("Error fetching skills");
      }
    }
  };

  useEffect(() => {
    fetchSkill();
  }, [cateJobCode]);

  const handleBadgeClick = (skill) => {
    if (!selectedSkills.find((s) => s.id === skill.id)) {
      setSuggestedSkills(suggestedSkills.filter((s) => s.id !== skill.id));
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemove = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== skill.id));
    setSuggestedSkills([...suggestedSkills, skill]);
  };

  //fetch candidate
  const [fetchedCandidate, setFetchedCandidate] = useState([]);
  const [allCandidate, setAllCandidate] = useState([]);
  const [count, setCount] = useState();

  const filters = {
    ...dreamJob,
    addressCode: dreamJob.province,
    experienceJobCode: dreamJob.exp,
    salaryJobCode: dreamJob.salary,
    jobLevelCode: dreamJob.jobLevel,
    workTypeCode: dreamJob.workType,
    categoryJobCode: dreamJob.jobType,
    genderCode: dreamJob.genderPost,
    listSkills: selectedSkills.map((skill) => skill.id),
  };

  useEffect(() => {
    const fetchAllCandidate = async () => {
      try {
        const response = await handleFindCv(filters);
        const count = response.data.count;
        setAllCandidate(response.data.data);
        setCount(count);
        console.log(response.data.data);
        if (response) {
          console.log("Profile updated successfully");
        } else {
          console.log("Profile update failed");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllCandidate();
  }, []);

  const handleFilter = async () => {
    console.log(filters);
    setLoading(true); // Show loading when the filter is triggered

    try {
      const response = await handleFindCv(filters);
      const count = response.data.count;
      setFetchedCandidate(response.data.data);
      setCount(count);
      console.log("candidates", response.data.data);
      if (response) {
        console.log("Profile updated successfully");
      } else {
        console.log("Profile update failed");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Hide loading once the filter is done
    }
  };

  useEffect(() => {
    handleFilter();
  }, []);

  const handleReset = () => {
    setLoading(true); // Show loading when reset is triggered
    setDreamJob({
      province: "",
      jobType: "",
      jobLevel: "",
      salary: "",
      workType: "",
      exp: "",
      genderPost: "",
    });
    setSelectedSkills([]);
    setFetchedCandidate([]);

    setTimeout(() => {
      setLoading(false); // Hide loading after resetting (using a timeout to simulate reset delay)
    }, 500); // Adjust the timeout as needed
  };

  const companyId = JSON.parse(localStorage.getItem("companyId"));
  const [view, setView] = useState();
  const fetchCompany = async (companyId) => {
    try {
      const response = await getCompanyById(companyId);
      const company = response.data.data;
      setView(company.allowCv);
      console.log("Response ", response, company.allowCv);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    fetchCompany(companyId);
  }, []);

  const [user, setUser] = useState();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  const fetchUser = async (userId) => {
    try {
      const response = await axios.get(`/getUserById?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });

      if (response.data) {
        setUser(response.data.data);
        console.log("User data set in Redux and localStorage:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  return (
    <div className="grid grid-cols-3 gap-4 overflow-visible flex-grow">
      <GlobalLoadingMain isSubmiting={loading} />
      {/* left */}
      <div className="col-span-1 bg-white p-4 shadow-lg rounded-xl border border-slate-100 mt-4 mb-4 h-full max-h-[780px] sticky top-[100px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFilter();
          }}
          className=""
        >
          <p className="text-2xl font-semibold text-primary">Filter</p>
          <Separator className="mt-2" />
          {/* form */}
          <ScrollArea className="max-h-[70vh] overflow-auto">
            <div className="w-full mb-4">
              <p className="text-xl font-medium mt-2 mb-2 text-primary">
                Sort candidates with category
              </p>
              <div className="ml-1 w-4/5">
                <Select
                  className=""
                  value={dreamJob.jobType}
                  onValueChange={(value) =>
                    setDreamJob({ ...dreamJob, jobType: value })
                  }
                >
                  <SelectTrigger className="w-full shrink basis-1/4 ">
                    <SelectValue placeholder="Choose a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(jobType) &&
                      jobType.map((data, index) => (
                        <SelectItem key={index} value={data.code}>
                          {data.value}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* desired job */}
            <div>
              <p className="text-xl font-medium mt-2 mb-4 text-primary">
                Desired Job
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                <div className="space-y-2 col-span-1">
                  <div className="font-medium">Work Location:</div>

                  <Select
                    value={dreamJob.province}
                    onValueChange={(value) =>
                      setDreamJob({ ...dreamJob, province: value })
                    }
                    className="flex items-center"
                  >
                    <SelectTrigger className="w-full shrink basis-1/4 ">
                      <SelectValue placeholder="Choose a location..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(province) &&
                        province.map((data, index) => (
                          <SelectItem key={index} value={data.code}>
                            {data.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Job Level:</div>
                  <Select
                    className="flex items-center"
                    value={dreamJob.jobLevel}
                    onValueChange={(value) =>
                      setDreamJob({ ...dreamJob, jobLevel: value })
                    }
                  >
                    <SelectTrigger className="w-full shrink basis-1/4 ">
                      <SelectValue placeholder="Choose your level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(jobLevel) &&
                        jobLevel.map((data, index) => (
                          <SelectItem key={index} value={data.code}>
                            {data.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Salary:</div>
                  <Select
                    className="flex items-center"
                    value={dreamJob.salary}
                    onValueChange={(value) =>
                      setDreamJob({ ...dreamJob, salary: value })
                    }
                  >
                    <SelectTrigger className="w-full shrink basis-1/4 ">
                      <SelectValue placeholder="Choose your salary..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(salary) &&
                        salary.map((data, index) => (
                          <SelectItem key={index} value={data.code}>
                            {data.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Employment Type:</div>
                  <Select
                    className="flex items-center"
                    value={dreamJob.workType}
                    onValueChange={(value) =>
                      setDreamJob({ ...dreamJob, workType: value })
                    }
                  >
                    <SelectTrigger className="w-full shrink basis-1/4 ">
                      <SelectValue placeholder="Choose your employment type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(workType) &&
                        workType.map((data, index) => (
                          <SelectItem key={index} value={data.code}>
                            {data.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Experience:</div>
                  <Select
                    className="flex items-center"
                    value={dreamJob.exp}
                    onValueChange={(value) =>
                      setDreamJob({ ...dreamJob, exp: value })
                    }
                  >
                    <SelectTrigger className="w-full shrink basis-1/4 ">
                      <SelectValue placeholder="Choose experience..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(exp) &&
                        exp.map((data, index) => (
                          <SelectItem key={index} value={data.code}>
                            {data.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Gender</div>
                  <Select
                    className="flex items-center"
                    value={dreamJob.genderPost}
                    onValueChange={(value) =>
                      setDreamJob({ ...dreamJob, genderPost: value })
                    }
                  >
                    <SelectTrigger className="w-full shrink basis-1/4 ">
                      <SelectValue placeholder="Choose gender..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(genderPost) &&
                        genderPost.map((data, index) => (
                          <SelectItem key={index} value={data.code}>
                            {data.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {/* skill */}
            <div className="mt-4">
              <p className="text-xl font-medium mb-4 text-primary">Skills</p>
              <div className="flex flex-col items-center space-y-6 px-1">
                <div className="flex flex-col w-full max-w-lg gap-1.5">
                  <Label htmlFor={"cate"}>Category</Label>
                  <Select onValueChange={(value) => setCateJobCode(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(data) &&
                        data.map((cate, index) => (
                          <SelectItem key={index} value={cate.code}>
                            {cate.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col w-full max-w-lg gap-1.5">
                  <Label htmlFor="skills">Your skill</Label>

                  <div className="flex flex-wrap h-auto items-center w-full rounded-lg border border-input bg-background text-sm ring-offset-background ">
                    {selectedSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-secondary hover:cursor-pointer border-2 flex flex-shrink-0 items-center mx-1 my-1"
                      >
                        <span>{skill.name}</span>
                        <CloseOutlined
                          className="text-gray-400 hover:text-red-400 p-1"
                          onClick={() => handleRemove(skill)}
                        />
                      </Badge>
                    ))}

                    <Input
                      placeholder="Choose Skill"
                      disabled
                      className="h-10 w-28 border-none flex-grow"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center h-full w-fit max-w-4xl">
                  <p className="text-center text-base font-medium">
                    Choose a suggested skill below
                  </p>

                  <div className="flex flex-wrap space-x-4  mt-2">
                    {Array.isArray(suggestedSkills) &&
                      suggestedSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-secondary hover:cursor-pointer border-2 hover:border-primary my-1"
                          onClick={() => handleBadgeClick(skill)}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* button */}
            <div className="flex gap-2 mt-2 justify-end mr-4">
              <Button
                onClick={handleReset}
                className="text-white"
                type="button"
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="text-primary border border-primary hover:bg-primary hover:text-white"
              >
                Search
              </Button>
            </div>
          </ScrollArea>
        </form>
      </div>
      {/* Right */}
      <div className="col-span-2 bg-white p-4 shadow-lg rounded-xl border border-slate-100 mt-4 mb-4 ">
        <GlobalLoadingMain isSubmiting={loading} />
        <div className="flex justify-between items-center">
          <p className="text-2xl font-semibold text-primary">
            Filtered Candidate
          </p>

          <p className="text-md font-medium text-primary">
            Found {count} candidate(s)
          </p>
        </div>
        <Separator className="mt-2" />

        {/* card  */}
        <div>
          <div className="flex flex-col">
            <CandidateCard candidates={fetchedCandidate} view={view} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindCandidate;
