"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import type { Reimbursement } from "@/types/reimbursement";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const { token, user } = useAuth();
  const [pendingReimbursements, setPendingReimbursements] = useState<
    Reimbursement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const fetchPendingReimbursements = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reimbursements`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pending reimbursements");
        }

        const result = await response.json();
        setPendingReimbursements(result.data);
      } catch (err) {
        setError("Failed to load pending reimbursements");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoading) {
      console.log(user, user?.role, "!isLoading");
      if (!user || (user.role !== "manager" && user.role !== "admin")) {
        router.push("/");
      }
    }

    if (token) {
      fetchPendingReimbursements();
    }
  }, [token]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reimbursements/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve reimbursement");
      }

      // Remove the approved reimbursement from the list
      setPendingReimbursements(
        pendingReimbursements.filter((r) => r.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to approve reimbursement");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reimbursements/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject reimbursement");
      }

      // Remove the rejected reimbursement from the list
      setPendingReimbursements(
        pendingReimbursements.filter((r) => r.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to reject reimbursement");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manager Dashboard
        </h1>

        <div className="card">
          <h2 className="text-lg font-medium mb-4">
            Pending Approval Requests
          </h2>

          {isLoading ? (
            <p>Loading pending requests...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : pendingReimbursements.length === 0 ? (
            <p>No pending reimbursement requests.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Employee</th>
                    <th className="table-header-cell">Title</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell">Amount</th>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {pendingReimbursements.map((reimbursement) => (
                    <tr key={reimbursement.id} className="table-row">
                      <td className="table-cell">{reimbursement.user?.name}</td>
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
                        ${reimbursement.amount.toFixed(2)}
                      </td>
                      <td className="table-cell">
                        {new Date(
                          reimbursement.created_at
                        ).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(reimbursement.id)}
                            className="btn btn-success text-xs py-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(reimbursement.id)}
                            className="btn btn-danger text-xs py-1"
                          >
                            Reject
                          </button>
                        </div>
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
