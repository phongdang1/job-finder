import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUserPackage } from "@/fetchData/Package";
import AdminPagination from "./AdminPagination";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { RiFileExcel2Line } from "react-icons/ri";

export function TableDemo() {
  const [userPackages, setUserPackages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUserPackages = async () => {
      try {
        const response = await getAllUserPackage();
        if (response?.data?.errCode === 0) {
          setUserPackages(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user packages:", error);
      }
    };

    fetchUserPackages();
  }, []);

  const totalPages = Math.ceil(userPackages.length / itemsPerPage);

  const paginatedData = userPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Service Packs");

    worksheet.columns = [
      { header: "STT", key: "stt", width: 10 },
      { header: "User Email", key: "email", width: 30 },
      { header: "Package Name", key: "packageName", width: 25 },
      { header: "Price", key: "price", width: 15 },
      { header: "Type", key: "type", width: 15 },
    ];

    userPackages.forEach((userPackage, index) => {
      worksheet.addRow({
        stt: index + 1,
        email: userPackage.userPackageData.email,
        packageName: userPackage.PackageData.name,
        price: userPackage.PackageData.price,
        type: userPackage.PackageData.type,
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "User_Service_Packs.xlsx");
  };

  // Tính tổng giá tiền
  const totalPrice = userPackages.reduce(
    (sum, userPackage) => sum + Number(userPackage.PackageData.price || 0),
    0
  );

  return (
    <div className="w-full p-6">
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleExportToExcel}
          className="bg-third hover:text-white text-white rounded-md px-4 py-2 flex items-center gap-2"
        >
          Export to Excel <RiFileExcel2Line className="w-5 h-5" />
        </Button>
      </div>
      <Table className="bg-white border border-gray-200 rounded-lg shadow-md">
        <TableCaption className="text-lg font-semibold text-gray-700">
          List of User Service Packs
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-200 text-gray-600">
            <TableHead className="w-[50px] text-center font-bold">
              STT
            </TableHead>
            <TableHead className="text-center font-bold">User Email</TableHead>
            <TableHead className="text-center font-bold">
              Package Name
            </TableHead>
            <TableHead className="text-center font-bold">Price</TableHead>
            <TableHead className="text-center font-bold">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((userPackage, index) => (
            <TableRow key={userPackage.packageId} className="hover:bg-gray-100">
              <TableCell className="text-center">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell className="text-center">
                {userPackage.userPackageData.email}
              </TableCell>
              <TableCell className="text-center">
                {userPackage.PackageData.name}
              </TableCell>
              <TableCell className="text-center">
                ${userPackage.PackageData.price}
              </TableCell>
              <TableCell className="text-center">
                {userPackage.PackageData.type}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-gray-200">
            <TableCell colSpan={3} className="text-right font-bold">
              Total:
            </TableCell>
            <TableCell className="text-center font-bold text-green-600">
              ${totalPrice.toFixed(2)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="mt-4">
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
