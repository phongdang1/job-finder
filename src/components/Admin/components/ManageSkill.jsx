import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { Input } from "@/components/ui/input";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@/components/ui/button";
import {
  handleCreateNewSkill,
  handleUpdateSkill,
  handleDeleteSkill,
  getAllSkill,
} from "../../../fetchData/Skill";
import { Label } from "@/components/ui/label";
import AdminPagination from "./AdminPagination";
import axios from "../../../fetchData/axios";
import AdminValidationSkill from "../common/AdminValidationSkill";
import toast from "react-hot-toast";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";
import GlobalLoadingMain from "@/components/GlobalLoading/GlobalLoadingMain";

const ManageSkill = () => {
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false); // Trạng thái cho modal xóa
  const [skillToDelete, setSkillToDelete] = useState(null); // Kỹ năng sẽ xóa
  const [newSkill, setNewSkill] = useState({ name: "", categoryJobCode: "" });
  const [updateSkill, setUpdateSkill] = useState({
    id: "",
    name: "",
    categoryJobCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [totalCount, setTotalCount] = useState(null); // Total number of skills
  const skillsPerPage = 5; // Number of skills per page

  const categories = [
    { code: "all", label: "All" },
    { code: "congNgheThongTin", label: "Công Nghệ Thông Tin" },
    { code: "giaoVien", label: "Giáo Viên" },
    { code: "luat", label: "Luật" },
    { code: "kinhTe", label: "Kinh Tế" },
    { code: "batDongSan", label: "Bất Động Sản" },
    { code: "quanLyNhanSu", label: "Quản Lý Nhân Sự" },
    { code: "truyenThong", label: "Truyền Thông" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchSkills = async (searchKey = "", selectedCategory = "all") => {
    try {
      const response = await axios.get("/getAllSkill", {
        params: {
          searchKey,
          category: selectedCategory,
        },
      });
      setTimeout(() => {
        if (response.data.errCode === 0) {
          setSkills(response.data.data);
          setTotalCount(response.data.count); // Set total count for pagination
        } else {
          setError(response.data.errMessage || "Error fetching skills");
          setSkills([]);
        }
        setLoading(false); // Dừng loading sau 3 giây
      }, 1000); // Thời gian chờ là 3 giây
    } catch (error) {
      setTimeout(() => {
        setError("Error fetching data. Please try again later.");
        setSkills([]);
      }, 1000); // Thời gian chờ là 3 giây
    }
  };

  useEffect(() => {
    fetchSkills(searchTerm, selectedCategory); // Trigger search whenever `searchTerm` or `selectedCategory` changes
  }, [searchTerm, currentPage, selectedCategory]);

  const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const handleSearchInputChange = (e) => setSearchTerm(e.target.value);

  const handleSearchClick = () => {
    fetchSkills(searchTerm, selectedCategory);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    setNewSkill({ name: "", categoryJobCode: "" });
    setErrorMessage({}); // Reset errorMessage for create modal
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewSkill({ name: "", categoryJobCode: "" });
    setErrorMessage({}); // Reset errorMessage when closing create modal
  };

  const handleOpenUpdateModal = (skill) => {
    setUpdateSkill(skill);
    setUpdateModalOpen(true);
    setErrorMessage({}); // Reset errorMessage for update modal
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setUpdateSkill({ id: "", name: "", categoryJobCode: "" });
    setErrorMessage({}); // Reset errorMessage when closing update modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (isCreateModalOpen) {
      setNewSkill((prev) => ({ ...prev, [name]: value }));
      const errors = AdminValidationSkill({ ...newSkill, [name]: value }, true);
      setErrorMessage((prev) => ({ ...prev, [name]: errors[name] || "" }));
    } else if (isUpdateModalOpen) {
      setUpdateSkill((prev) => ({ ...prev, [name]: value }));
      const errors = AdminValidationSkill(
        { ...updateSkill, [name]: value },
        false
      );
      setErrorMessage((prev) => ({ ...prev, [name]: errors[name] || "" }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = AdminValidationSkill(newSkill, true);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage(validationErrors);
      return;
    }

    setIsSubmiting(true);

    try {
      const response = await handleCreateNewSkill(newSkill);
      if (response.data && response.data.errCode === 0) {
        setSkills((prev) => [...prev, newSkill]);
        fetchSkills([]);
        toast.success("Skill created successfully!");
      } else {
        console.error("Failed to create skill:", response.data);
        toast.error(
          `Failed to create skill: ${response.data.message || "Unknown error"}`
        );
      }
      handleCloseCreateModal();
    } catch (error) {
      console.error("Error saving skill:", error);
    } finally {
      setIsSubmiting(false); // Hide Lottie animation
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = AdminValidationSkill(updateSkill, false);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage(validationErrors);
      return;
    }

    setIsSubmiting(true);

    try {
      const response = await handleUpdateSkill(updateSkill);
      if (response.data && response.data.errCode === 0) {
        setSkills((prev) =>
          prev.map((skill) =>
            skill.id === updateSkill.id
              ? {
                  ...skill,
                  name: updateSkill.name,
                  categoryJobCode: updateSkill.categoryJobCode,
                }
              : skill
          )
        );
        toast.success("Skill updated successfully!");
      } else {
        console.error("Failed to update skill:", response.data);
        toast.error(
          `Failed to update skill: ${response.data.message || "Unknown error"}`
        );
      }
      handleCloseUpdateModal();
    } catch (error) {
      console.error("Error updating skill:", error);
    } finally {
      setIsSubmiting(false); // Hide Lottie animation
    }
  };

  const handleDeleteSkill = async (skillId) => {
    setIsSubmiting(true);

    try {
      const token = localStorage.getItem("token"); // Adjust if token is stored elsewhere
      const response = await axios.post(
        "/deleteSkill",
        {
          skillId: skillId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token if required
          },
        }
      );

      if (response.data && response.data.errCode === 0) {
        fetchSkills();
        toast.success("Skill deleted successfully!");
      } else {
        console.error("Failed to delete skill:", response.data);
        toast.error(
          `Failed to delete skill: ${
            response.data.errMessage || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    } finally {
      setIsSubmiting(false);
    }
  };

  const filteredSkills = skills.filter((skill) =>
    removeDiacritics(skill.name.toLowerCase()).includes(
      removeDiacritics(searchTerm.toLowerCase())
    )
  );

  const handleOpenDeleteModal = (skillId) => {
    setSkillToDelete(skillId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSkill = async () => {
    if (skillToDelete) {
      await handleDeleteSkill(skillToDelete);
      setDeleteModalOpen(false);
      setSkillToDelete(null); // Reset skill to delete
    }
  };
  // Add the sorting logic here
  const sortedSkills =
    selectedCategory === "all"
      ? filteredSkills.sort((a, b) => b.id - a.id) // Sort in descending order by id
      : filteredSkills
          .filter((skill) => skill.categoryJobCode === selectedCategory)
          .sort((a, b) => b.id - a.id); // Sort filtered skills in descending order by id

  // Pagination logic
  const totalPages = Math.ceil(sortedSkills.length / skillsPerPage);
  const tol = Math.ceil(totalCount / skillsPerPage);
  const indexOfLastSkill = currentPage * skillsPerPage;
  const indexOfFirstSkill = indexOfLastSkill - skillsPerPage;
  const currentSkills = sortedSkills.slice(indexOfFirstSkill, indexOfLastSkill);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <GlobalLoadingMain isSubmiting={true} />;
  if (error) return <p>{error}</p>;

  return (
    <div className="border border-blue-gray-100 shadow-sm rounded-lg">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2 w-1/2">
          <div className="relative flex-grow">
            <Input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              type="text"
              placeholder="Search by skill name..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon sx={{ color: "gray" }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="category-select">Sort by Category:</Label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            {categories.map((category) => (
              <option key={category.code} value={category.code}>
                {category.label}
              </option>
            ))}
          </select>
          <Button
            onClick={handleOpenCreateModal}
            className="p-3 bg-third hover:text-white text-white rounded-md"
          >
            Create
          </Button>
        </div>
      </div>

      <Table className="table-auto w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">STT</TableHead>
            <TableHead className="text-center">Skill Name</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentSkills.map((skill, index) => (
            <TableRow
              key={skill.id}
              className="cursor-pointer hover:bg-slate-300"
            >
              <TableCell className="text-center">
                {index + 1 + (currentPage - 1) * skillsPerPage}
              </TableCell>
              <TableCell className="text-center">{skill.name}</TableCell>
              <TableCell className="text-center">
                {skill.categoryJobCode}
              </TableCell>
              <TableCell className="text-center flex space-x-3 items-center justify-center">
                <Button
                  onClick={() => handleOpenUpdateModal(skill)}
                  className="text-white bg-third hover:bg-primary rounded-md w-10 h-9"
                >
                  <EditNoteOutlinedIcon />
                </Button>
                <Button
                  onClick={() => handleOpenDeleteModal(skill.id)}
                  className="text-white bg-red-500 hover:bg-red-600 rounded-md w-10 h-9"
                >
                  <DeleteIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              <AdminPagination
                currentPage={currentPage}
                totalPages={tol}
                onPageChange={handlePageChange}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Create Skill Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Skill</DialogTitle>
            <DialogDescription>
              Enter the skill details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="mb-4">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                type="text"
                id="skill-name"
                name="name"
                value={newSkill.name}
                onChange={handleInputChange}
                className={`${
                  errorMessage.name ? "border-red-500" : "focus:border-primary"
                }`}
              />
              {errorMessage.name && (
                <p className="text-red-500  mb-3">{errorMessage.name}</p>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="category">Category</Label>
              <select
                id="category-select"
                name="categoryJobCode"
                value={newSkill.categoryJobCode}
                onChange={(e) => {
                  const selectedCategory = e.target.value;
                  setNewSkill((prevSkill) => ({
                    ...prevSkill,
                    categoryJobCode: selectedCategory,
                  }));
                  // Reset validation error for category
                  setErrorMessage((prev) => ({
                    ...prev,
                    categoryJobCode: "",
                  }));
                }}
                className="border border-gray-300 rounded-md p-2"
              >
                {categories
                  // .filter((category) => category.code !== "all")
                  .map((category) => (
                    <option key={category.code} value={category.code}>
                      {category.label}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              type="submit"
              className="p-3 bg-third hover:text-white text-white rounded-md"
            >
              Create
            </Button>
          </form>
          <GlobalLoading isSubmiting={isSubmiting} />
        </DialogContent>
      </Dialog>

      {/* Update Skill Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={handleCloseUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Skill</DialogTitle>
            <DialogDescription>
              Modify the skill details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="mb-4">
              <Label htmlFor="update-skill-name">Skill Name</Label>
              <Input
                type="text"
                id="update-skill-name"
                name="name"
                value={updateSkill.name}
                onChange={handleInputChange}
                className={`${
                  errorMessage.name ? "border-red-500" : "focus:border-primary"
                }`}
              />
              {errorMessage.name && (
                <p className="text-red-500 mb-3">{errorMessage.name}</p>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="update-category">Category</Label>
              <select
                id="update-category"
                name="categoryJobCode"
                value={updateSkill.categoryJobCode}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded-md p-2"
              >
                {categories
                  .filter((category) => category.code !== "all") // Exclude "All"
                  .map((category) => (
                    <option key={category.code} value={category.code}>
                      {category.label}
                    </option>
                  ))}
              </select>
            </div>
            <Button type="submit" className="bg-primary text-white">
              Update Skill
            </Button>
          </form>
          <GlobalLoading isSubmiting={isSubmiting} />
        </DialogContent>
      </Dialog>

      {/* Delete Skill Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={() => setDeleteModalOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this skill?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              className="bg-third hover:text-white text-white rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteSkill}
              className="bg-third hover:text-white text-white rounded-md"
            >
              Confirm
            </Button>
            <GlobalLoading isSubmiting={isSubmiting} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSkill;
