import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AddCircleOutline, Check, EditNoteOutlined } from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CloseOutlined } from "@mui/icons-material";
import { getUsersById, handleSetDataUserDetail } from "@/fetchData/User";
import { getAllCodeByType, getValueByCode } from "@/fetchData/AllCode";
import { getAllSkillByCategory } from "@/fetchData/Skill";
import { ScrollArea } from "@/components/ui/scroll-area";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";
import toast from "react-hot-toast";
import Validation from "../Common/Validation";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BiLock } from "react-icons/bi";

function AdvancedSetting() {
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [data, setData] = useState([]);
  const [cateJobCode, setCateJobCode] = useState("");
  const [userSkill, setUserSkill] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});
  const [open, setOpen] = useState(false); //open cái skill
  const [isDialogOpen, setIsDialogOpen] = useState(false); //open cái công việc mơ ước
  const [type, setType] = useState("");
  const [province, setProvince] = useState([]);
  const [jobType, setJobType] = useState([]);
  const [jobLevel, setJobLevel] = useState([]);
  const [salary, setSalary] = useState([]);
  const [workType, setWorkType] = useState([]);
  const typeKey = ["PROVINCE", "JOBTYPE", "JOBLEVEL", "SALARYTYPE", "WORKTYPE"];

  const [addressCode, setAddressCode] = useState([]);
  const [categoryJobCode, setCategoryJobCode] = useState([]);
  const [jobLevelCode, setJobLevelCode] = useState([]);
  const [salaryJobCode, setSalaryJobCode] = useState([]);
  const [workTypeCode, setWorkTypeCode] = useState([]);
  const [code, setCode] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to control loading
  const [isLoading, setIsLoading] = useState(false);
  const [dreamJob, setDreamJob] = useState({
    province: "",
    jobType: "",
    jobLevel: "",
    salary: "",
    workType: "",
  });

  const userId = localStorage.getItem("user_id");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")).data
  );
  const [isFindJob, setIsFindJob] = useState(false);
  const [isTakeMail, setIsTakeMail] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await getUsersById(userId); // Replace with your API call
        if (response.data) {
          setIsFindJob(response.data.data.UserDetailData.isFindJob === 1);
          setIsTakeMail(response.data.data.UserDetailData.isTakeMail === 1);
        }
      } catch (error) {
        console.error("Error fetching user dat", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getAllCodeByType("JOBTYPE");
        setData(response.data.data);
        // console.log(response.data.data);
      } catch (error) {
        console.log("Error fetching job categories");
      }
    };

    fetchCategory();
  }, []);

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

        // console.log(JSON.stringify(results[3], null, 2));
      } catch (error) {
        console.log("Error fetching job types");
      }
    };
    fetchJobType();
  }, [type]);

  const fetchSkill = async () => {
    if (cateJobCode) {
      try {
        const response = await getAllSkillByCategory(cateJobCode);
        const fetchedSkills = response.data.data;
        const filteredSkills = fetchedSkills.filter(
          (skill) =>
            !selectedSkills.some((s) => s.id === skill.id) &&
            !userSkill.listSkill.some((us) => us.skillId === skill.id)
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

  const [dreamJobValue, setDreamJobValue] = useState([]);
  const fetchUserSkill = async () => {
    try {
      const response = await getUsersById(userId);
      const userData = response.data.data;

      setDreamJobValue(userData);
      setUserSkill(userData);
      setUser(userData);

      const codes = [
        userData.UserDetailData.addressCode,
        userData.UserDetailData.categoryJobCode,
        userData.UserDetailData.jobLevelCode,
        userData.UserDetailData.salaryJobCode,
        userData.UserDetailData.workTypeCode,
      ];

      const codePromises = codes.map((code) => getValueByCode(code));
      const results = await Promise.all(codePromises);

      setAddressCode(results[0]?.data.data);
      setCategoryJobCode(results[1]?.data.data);
      setJobLevelCode(results[2]?.data.data);
      setSalaryJobCode(results[3]?.data.data);
      setWorkTypeCode(results[4]?.data.data);

      console.log(results[0].data.data);
    } catch (error) {
      console.log("Error fetching job categories");
    }
  };

  useEffect(() => {
    fetchUserSkill();
    console.log("isFindJob", isFindJob);
  }, [isFindJob]);

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

  const handleRemoveUserSkill = (skillToRemove) => {
    const updatedUserSkills = userSkill.listSkill.filter(
      (us) => us.skillId !== skillToRemove.skillId
    );

    setUserSkill((prevUserSkill) => ({
      ...prevUserSkill,
      listSkill: updatedUserSkills,
    }));

    setSuggestedSkills([...suggestedSkills, skillToRemove]);
  };

  // Function to handle updating skills and clearing the selection after saving
  const handleSkill = async (e) => {
    e.preventDefault();

    // Get all skill IDs, including previous user skills and selected skills
    const skillIds = [
      ...selectedSkills.map((skill) => skill.id),
      ...userSkill.listSkill.map((uskill) => uskill.skillId),
    ];

    if (skillIds.length === 0) {
      toast.error("Please select at least one skill to add.");
      return;
    }

    try {
      const dataSent = {
        userId: userId,
        data: { listSkills: skillIds },
      };

      const response = await handleSetDataUserDetail(dataSent);

      if (response) {
        // Update userSkill with combined skills and clear selectedSkills
        setUserSkill((prevUserSkill) => ({
          ...prevUserSkill,
          listSkill: [
            ...prevUserSkill.listSkill,
            ...selectedSkills.map((skill) => ({
              skillId: skill.id,
              skillData: skill,
            })),
          ],
        }));

        setSelectedSkills([]); // Clear the selected skills after saving

        toast.success("Successfully updated your profile!");
        fetchSkill();
        fetchUserSkill();
        setOpen(false);
        console.log("Profile updated successfully");
      } else {
        console.log("Profile update failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDreamJobSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = Validation(dreamJob);
    setErrorMessage(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const userData = {
          userId: userId,
          data: {
            addressCode: dreamJob.province,
            categoryJobCode: dreamJob.jobType,
            jobLevelCode: dreamJob.jobLevel,
            salaryJobCode: dreamJob.salary,
            workTypeCode: dreamJob.workType,
          },
        };

        const response = await handleSetDataUserDetail(userData);

        if (response) {
          setTimeout(() => {
            toast.success("Successfully updated your dream job!");
          }, 2000);
          fetchUserSkill();
          setIsDialogOpen(false);
          console.log("Profile updated successfully");
        } else {
          console.log("Profile update failed");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("LOI ROI");
    }
  };

  const handleEnableJobSeeker = async () => {
    const userData = {
      userId: userId,
      data: {
        isFindJob: 1,
      },
    };

    setIsSubmitting(true); // Set submitting to true before the API call

    try {
      const res = await handleSetDataUserDetail(userData);

      if (res.data.errCode === 0) {
        toast.success("Job Seeker mode has been enabled");
        console.log(res);
        setIsFindJob(true);
        // fetchUserSkill();
      } else {
        console.log("Error enabling Job Seeker mode");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      // You can also handle any errors here, such as displaying a toast error message
    } finally {
      setIsSubmitting(false); // Ensure submitting is turned off regardless of success or failure
    }
  };

  const handleDisableJobSeeker = async () => {
    const userData = {
      userId: userId,
      data: {
        isFindJob: "0",
      },
    };

    setIsSubmitting(true); // Set submitting to true before the API call

    try {
      const res = await handleSetDataUserDetail(userData);

      if (res.data.errCode === 0) {
        toast.error("Disabled Job Seeker mode");
        console.log(res);
        setIsFindJob(false);
      } else {
        console.log("Error disabling Job Seeker mode");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      // Handle any API call errors here if needed
    } finally {
      setIsSubmitting(false); // Ensure submitting is turned off regardless of success or failure
    }
  };

  const handleEnableJobSuggestion = async () => {
    const userData = {
      userId: userId,
      data: {
        isTakeMail: 1,
      },
    };

    setIsSubmitting(true); // Set submitting to true before the API call

    try {
      const res = await handleSetDataUserDetail(userData);

      if (res.data.errCode === 0) {
        toast.success("Job Suggestion has been enabled");
        console.log(res);
        setIsTakeMail(true);
      } else {
        console.log("Error enabling Job Suggestion");
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setIsSubmitting(false); // Ensure submitting is turned off regardless of success or failure
    }
  };

  const handleDisableJobSuggestion = async () => {
    const userData = {
      userId: userId,
      data: {
        isTakeMail: "0",
      },
    };

    setIsSubmitting(true); // Set submitting to true before the API call

    try {
      const res = await handleSetDataUserDetail(userData);

      if (res.data.errCode === 0) {
        toast.error("Disabled Job Suggestion");
        console.log(res);
        setIsTakeMail(false);
      } else {
        console.log("Error disabling Job Suggestion");
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setIsSubmitting(false); // Ensure submitting is turned off regardless of success or failure
    }
  };

  return (
    <>
      {isLoading ? (
        <GlobalLoadingMain isSubmiting={isLoading} />
      ) : (
        <div className="w-full space-y-4 flex-grow">
          <div className="bg-white h-fit rounded-lg font-poppins text-xl md:text-2xl font-medium py-2">
            <p className="ml-4 mt-2 italic">
              Setting your Skills to attract Employers and your Desired Job{" "}
            </p>
            <div className="px-4 my-3">
              <Separator />
            </div>
            <div>
              <form
                onSubmit={handleSkill}
                className="flex justify-between items-center"
              >
                <p className="ml-4 mb-2">Skills</p>

                <EditNoteOutlined
                  onClick={() => {
                    setOpen(true);
                  }}
                  className="hover:text-primary mr-4 cursor-pointer"
                />

                <Dialog open={open} onOpenChange={() => setOpen(false)}>
                  <DialogContent className="max-w-screen-sm h-4/5 max-h-screen">
                    <DialogHeader>
                      <DialogTitle>Update Skills</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="w-full h-4/5">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="flex flex-col w-full max-w-lg gap-1.5">
                          <Label htmlFor={"cate"}>Category</Label>
                          <Select
                            onValueChange={(value) => setCateJobCode(value)}
                          >
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
                          <div className="space-x-2">
                            {/* Chosen Skills */}
                            {Array.isArray(userSkill?.listSkill) &&
                              userSkill.listSkill.length > 0 && (
                                <>
                                  <p className="text-sm mb-1">
                                    Chosen skills:{" "}
                                  </p>
                                  {userSkill.listSkill.map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-secondary hover:cursor-pointer border-2 hover:border-primary my-1"
                                    >
                                      {skill.skillData.name}
                                      <CloseOutlined
                                        className="text-gray-400 hover:text-red-400 p-1"
                                        onClick={() =>
                                          handleRemoveUserSkill(skill)
                                        }
                                      />
                                    </Badge>
                                  ))}
                                </>
                              )}

                            {/* New Skills Added */}
                            {selectedSkills.length > 0 && (
                              <>
                                <p className="text-sm my-1">
                                  New skills added:{" "}
                                </p>
                                {selectedSkills.map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-secondary hover:cursor-pointer border-2 mx-1 my-1"
                                  >
                                    <span>{skill.name}</span>
                                    <CloseOutlined
                                      className="text-gray-400 hover:text-red-400 p-1"
                                      onClick={() => handleRemove(skill)}
                                    />
                                  </Badge>
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center h-full w-fit max-w-4xl ml-12">
                          {suggestedSkills.length > 0 ? (
                            <p className="text-center text-base font-medium">
                              Choose a suggested skill below
                            </p>
                          ) : (
                            <p className="text-center text-base font-medium">
                              You have choose all skills from this category
                            </p>
                          )}

                          <div className="flex flex-wrap space-x-2 mt-2">
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
                    </ScrollArea>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        className="hover:bg-primary hover:text-white"
                        onClick={handleSkill}
                      >
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </form>
            </div>

            {/* userSkill */}

            {Array.isArray(userSkill?.listSkill) &&
            userSkill.listSkill.length > 0 ? (
              <div className="flex gap-2 ml-4 space-x-2">
                {userSkill.listSkill.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="disabled"
                    className="bg-secondary text-third/70 py-1 rounded-md flex gap-2"
                    // onClick={() => handleBadgeClick(skill)}
                  >
                    <p>{skill.skillData.name}</p>
                    <Check fontSize="small" />
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm ml-4 mb-2 italic text-gray-400 font-normal w-4/5">
                In this section, you should list the skills that are relevant to
                the position or career field you are interested in.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 min-h-[200px]">
            {/* dream job */}
            <div className="bg-white rounded-lg font-poppins text-xl md:text-2xl font-medium py-4 flex flex-col h-full">
              <div className="flex justify-between items-center">
                <p className="ml-4 mb-2">Dream Job</p>

                <form onSubmit={handleDreamJobSubmit}>
                  <EditNoteOutlined
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                    className="hover:text-primary mr-4 cursor-pointer"
                  />
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={() => setIsDialogOpen(false)}
                  >
                    <DialogContent className="max-w-4xl max-h-svh h-4/5">
                      <DialogHeader>
                        <DialogTitle>Dream Job</DialogTitle>
                        <DialogDescription className="italic">
                          Set up your dream job
                        </DialogDescription>
                      </DialogHeader>

                      <ScrollArea className="w-full h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
                          <div className="space-y-2 col-span-2">
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
                            {errorMessage.province && (
                              <p className="text-red-500 text-sm mt-1">
                                {errorMessage.province}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="font-medium">
                              Occupation Category:
                            </div>
                            <Select
                              className="flex items-center"
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
                            {errorMessage.jobType && (
                              <p className="text-red-500 text-sm mt-1">
                                {errorMessage.jobType}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="font-medium">
                              Desired Job Level:
                            </div>
                            <Select
                              className="flex items-center"
                              value={dreamJob.jobLevel}
                              onValueChange={(value) =>
                                setDreamJob({ ...dreamJob, jobLevel: value })
                              }
                            >
                              <SelectTrigger className="w-full shrink basis-1/4 ">
                                <SelectValue placeholder="Choose your desired level..." />
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
                            {errorMessage.jobLevel && (
                              <p className="text-red-500 text-sm mt-1">
                                {errorMessage.jobLevel}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="font-medium">Desired Salary:</div>
                            <Select
                              className="flex items-center"
                              value={dreamJob.salary}
                              onValueChange={(value) =>
                                setDreamJob({ ...dreamJob, salary: value })
                              }
                            >
                              <SelectTrigger className="w-full shrink basis-1/4 ">
                                <SelectValue placeholder="Choose your desired salary..." />
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
                            {errorMessage.salary && (
                              <p className="text-red-500 text-sm mt-1">
                                {errorMessage.salary}
                              </p>
                            )}
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
                            {errorMessage.workType && (
                              <p className="text-red-500 text-sm mt-1">
                                {errorMessage.workType}
                              </p>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className="hover:bg-primary hover:text-white"
                          onClick={handleDreamJobSubmit}
                        >
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </form>
              </div>
              {/* info of dream job */}
              {/* dreamJob */}
              {userSkill?.UserDetailData ? (
                <div className="ml-4 text-sm font-normal ">
                  <div className="flex gap-10 text-base">
                    <p className="text-gray-400 w-full max-w-28 font-medium">
                      Address
                    </p>{" "}
                    <p className="font-medium">{addressCode?.value}</p>
                  </div>
                  <div className="flex gap-10 text-base">
                    <p className="text-gray-400 w-full max-w-28 font-medium">
                      Job Category
                    </p>{" "}
                    <p className="font-medium">{categoryJobCode?.value}</p>
                  </div>
                  <div className="flex gap-10 text-base">
                    <p className="text-gray-400 w-full max-w-28 font-medium">
                      Job Level
                    </p>{" "}
                    <p className="font-medium">{jobLevelCode?.value}</p>
                  </div>
                  <div className="flex gap-10 text-base">
                    <p className="text-gray-400 w-full max-w-28 font-medium">
                      Salary
                    </p>{" "}
                    <p className="font-medium">{salaryJobCode?.value}</p>
                  </div>
                  <div className="flex gap-10 text-base">
                    <p className="text-gray-400 w-full max-w-28 font-medium">
                      Work Type
                    </p>{" "}
                    <p className="font-medium">{workTypeCode?.value}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm ml-4 mb-2 italic text-gray-400 font-normal">
                  <p>Set up your dream job here.</p>
                </div>
              )}
            </div>

            <div className="relative ">
              {/* Tooltip overlay and lock icon for non-VIP users */}
              {user && !user.isVip ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute inset-0 bg-white bg-opacity-60 flex justify-center items-center rounded-lg">
                        <BiLock className="text-primary opacity-70 text-3xl" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="w-[300px]">
                      <p className="font-normal">
                        This feature is available for VIP members only. Upgrade
                        to unlock advanced settings!
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                ""
              )}

              {/* Main content div */}
              <div
                className={`bg-white rounded-lg font-poppins text-xl md:text-2xl font-medium p-4 gap-6 flex flex-col h-full ${
                  !user?.isVip ? "pointer-events-none" : ""
                }`}
              >
                <p>Vip Functionality</p>
                <div className="flex gap-20">
                  {/* Job Seeker Mode */}
                  <div className="flex justify-center items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label>&quot;Job Seeker&quot; Mode</Label>
                        </TooltipTrigger>
                        <TooltipContent className="w-[450px]">
                          <p className="font-normal">
                            Enable{" "}
                            <span className="text-primary font-semibold">
                              Job Seeker Mode
                            </span>{" "}
                            to showcase your skills and get noticed by top
                            employers!
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>{" "}
                    <Switch
                      checked={isFindJob}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleEnableJobSeeker();
                          console.log("check ne", isFindJob);
                        } else {
                          handleDisableJobSeeker();
                          console.log("check ne", isFindJob);
                        }
                      }}
                    />
                    <GlobalLoadingMain isSubmiting={isSubmitting} />
                  </div>

                  {/* Job Suggestion */}
                  <div className="flex justify-center items-center gap-2 mr-32">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label>Job Suggestion</Label>
                        </TooltipTrigger>
                        <TooltipContent className="w-[450px]">
                          <p className="font-normal">
                            Enable{" "}
                            <span className="text-primary font-semibold">
                              Job Suggestion
                            </span>{" "}
                            to receive personalized job posts directly to your
                            email and never miss an opportunity!
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>{" "}
                    <Switch
                      checked={isTakeMail}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleEnableJobSuggestion();
                        } else {
                          handleDisableJobSuggestion();
                        }
                      }}
                    />
                    <GlobalLoadingMain isSubmiting={isSubmitting} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdvancedSetting;
