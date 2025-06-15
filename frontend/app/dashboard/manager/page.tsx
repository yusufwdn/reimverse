"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import type { Reimbursement } from "@/types/reimbursement";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommonModal from "@/components/common-modal";

export default function ManagerDashboard() {
  const { token, user } = useAuth();
  const [pendingReimbursements, setPendingReimbursements] = useState<
    Reimbursement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const [showAll, setShowAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Reimbursement | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const fetchPendingReimbursements = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manager/reimbursements`,
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
        const data = showAll
          ? result.data
          : result?.data?.filter((reimbursement: Reimbursement) => {
              return reimbursement.status == "pending";
            });
        setPendingReimbursements(data);
      } catch (err) {
        setError("Failed to load pending reimbursements");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoading) {
      if (!user || (user.role !== "manager" && user.role !== "admin")) {
        router.push("/");
      }
    }

    if (token) {
      fetchPendingReimbursements();
    }
  }, [token, showAll, isProcessing]);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/reimbursements/${id}/approve`,
        {
          method: "POST",
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
      // setPendingReimbursements(
      //   pendingReimbursements.filter((r) => r.id !== id)
      // );

      alert("Reimbursement has been approved.");
    } catch (err) {
      console.error(err);
      alert("Failed to approve reimbursement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const id = selectedItem?.id;

    if (!rejectReason) {
      alert("Reason cannot be empty.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/reimbursements/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: rejectReason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject reimbursement");
      }

      // Remove the rejected reimbursement from the list
      // setPendingReimbursements(
      //   pendingReimbursements.filter((r) => r.id !== id)
      // );

      // Remove selectedReimbursement
      setSelectedItem(null);

      alert("Reimbursement has been rejected.");
    } catch (err) {
      console.error(err);
      alert("Failed to reject reimbursement");
    } finally {
      setIsProcessing(false);
      setRejectModal(false);
    }
  };

  const showRejectModal = (reimbursement: Reimbursement) => {
    setRejectModal(true);
    setSelectedItem(reimbursement);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manager Dashboard
        </h1>

        <div className="card">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium mb-4">
              Pending Approval Requests
            </h2>
            <div>
              <input
                type="checkbox"
                id="show-deleted"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="show-deleted" className="text-sm">
                Show all (with history)
              </label>
            </div>
          </div>

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
                    <th className="table-header-cell">Receipt</th>
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
                        <Link href={reimbursement.receipt_url} target="_blank">
                          <div className="w-32 h-32">
                            <img src={reimbursement.receipt_url} />
                          </div>
                        </Link>
                      </td>
                      <td className="table-cell">
                        {reimbursement.category?.name}
                      </td>
                      <td className="table-cell">
                        Rp. {Number(reimbursement.amount).toFixed(2)}
                      </td>
                      <td className="table-cell">
                        {new Date(
                          reimbursement.created_at
                        ).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          {reimbursement.status != "pending" ? (
                            <>
                              {reimbursement.approved_at ? (
                                <div className="text-green-600">Approved</div>
                              ) : (
                                <div className="text-red-600">Rejected</div>
                              )}
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(reimbursement.id)}
                                className="btn btn-success text-xs py-1"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => showRejectModal(reimbursement)}
                                className="btn btn-danger text-xs py-1"
                              >
                                Reject
                              </button>
                            </>
                          )}
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

      <CommonModal
        show={rejectModal}
        title="Reject Reimbursement"
        onClose={() => setRejectModal(false)}
      >
        {/* Body Modal */}
        <div className="p-4 md:p-5 space-y-4">
          <div>
            <label htmlFor="reason" className="form-label">
              Reason
            </label>
            <input
              id="reason"
              type="text"
              className="form-input"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button
            type="button"
            className="btn-primary rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={handleReject}
          >
            {isProcessing ? "Processing..." : "Confirm Reject"}
          </button>
        </div>
      </CommonModal>
    </DashboardLayout>
  );
}
