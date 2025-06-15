"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import type { Reimbursement } from "@/types/reimbursement";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const router = useRouter();

  useEffect(() => {
    const fetchAllReimbursements = async () => {
      try {
        const url = showDeleted
          ? `${process.env.NEXT_PUBLIC_API_URL}/admin/reimbursements?with_trashed=true`
          : `${process.env.NEXT_PUBLIC_API_URL}/admin/reimbursements`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reimbursements");
        }

        const result = await response.json();
        setReimbursements(result.data);
      } catch (err) {
        setError("Failed to load reimbursements");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoading) {
      if (!user || user.role !== "admin") {
        router.push("/");
      }
    }

    if (token) {
      fetchAllReimbursements();
    }
  }, [token, showDeleted]);

  const filteredReimbursements = reimbursements.filter((reimbursement) => {
    // return reimbursement
    if (filterStatus === "all") return true;
    return reimbursement.status === filterStatus;
  });

  // console.log(reimbursements, 'reimbursements')
  // console.log(filteredReimbursements, 'filteredReimbursements')

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-pending";
      case "approved":
        return "badge-approved";
      case "rejected":
        return "badge-rejected";
      default:
        return "";
    }
  };

  if (!user || user.role !== "admin") {
    // router.push('/')
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>

        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-medium">All Reimbursement Requests</h2>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <label htmlFor="status-filter" className="mr-2 text-sm">
                  Status:
                </label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-input py-1 px-2"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-deleted"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="show-deleted" className="text-sm">
                  Show deleted items
                </label>
              </div>
            </div>
          </div>

          {isLoading ? (
            <p>Loading reimbursements...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredReimbursements.length === 0 ? (
            <p>No reimbursement requests found.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Employee</th>
                    <th className="table-header-cell">Title</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell">Amount</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Deleted</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredReimbursements.map((reimbursement) => (
                    <tr
                      key={reimbursement.id}
                      className={`table-row ${
                        reimbursement.deleted_at ? "bg-gray-100" : ""
                      }`}
                    >
                      <td className="table-cell">
                        {reimbursement.category?.name}
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">
                          {reimbursement.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reimbursement.description}
                        </div>
                      </td>
                      <td className="table-cell">
                        {reimbursement.category?.name}
                      </td>
                      <td className="table-cell">
                        Rp. {Number(reimbursement.amount).toFixed(2)}
                      </td>
                      <td className="table-cell">
                        <span
                          className={`badge ${getStatusBadgeClass(
                            reimbursement.status
                          )}`}
                        >
                          {reimbursement.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {new Date(
                          reimbursement.created_at
                        ).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        {reimbursement.deleted_at ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// "use client"

// import { useAuth } from "@/context/auth-context"
// import DashboardLayout from "@/components/dashboard-layout"

// export default function AdminDashboard() {
//   const { user } = useAuth()

//   console.log("AdminDashboard - Current user:", user) // Debug log

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p>Welcome to the Admin Dashboard!</p>
//           <p>Current user: {user?.name} ({user?.role})</p>
//         </div>
//       </div>
//     </DashboardLayout>
//   )
// }
