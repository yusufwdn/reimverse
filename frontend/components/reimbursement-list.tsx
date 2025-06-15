"use client";

import type { Reimbursement } from "@/types/reimbursement";
import CommonModal from "./common-modal";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

interface ReimbursementListProps {
  reimbursements: Reimbursement[];
}

export default function ReimbursementList({
  reimbursements,
}: ReimbursementListProps) {
  const { token } = useAuth();

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

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Reimbursement | null>(null);
  const [collectDeletedId, setCollectDeletedId] = useState<string[]>([]);

  const handleDelete = async () => {
    if (selectedItem) {
      setIsProcessing(true);
      try {
        const id: string = selectedItem.id;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reimbursements/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // check response
        if (!response.ok) {
          // console.error(await response.json())
          throw new Error("Failed to delete reimbursement");
        }

        // const result = await response.json();

        // collect deleteId for filter reimbursement
        setCollectDeletedId([...collectDeletedId, id]);
        alert("Reimbursement has been deleted");
      } catch (error) {
        console.error(error);
      } finally {
        setSelectedItem(null);
        setIsProcessing(false);
        setShowModal(false);
      }
    }
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">Title</th>
            <th className="table-header-cell">Category</th>
            <th className="table-header-cell">Amount</th>
            <th className="table-header-cell">Status</th>
            <th className="table-header-cell">Date</th>
            <th className="table-header-cell">Actions</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {reimbursements
            .filter((item) => !collectDeletedId.includes(item.id))
            .map((reimbursement) => (
              <tr key={reimbursement.id} className="table-row">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">
                    {reimbursement.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reimbursement.description}
                  </div>
                </td>
                <td className="table-cell">{reimbursement.category?.name}</td>
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
                  {new Date(reimbursement.created_at).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setSelectedItem(reimbursement);
                    }}
                    className="btn btn-danger text-xs py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <CommonModal
        show={showModal}
        title="Reject Reimbursement"
        onClose={() => setShowModal(false)}
      >
        {/* Body Modal */}
        <div className="p-4 md:p-5 space-y-4">
          <p>Are you sure want to delete this reimbursement?</p>
        </div>
        <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button
            type="button"
            className="btn-primary rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={handleDelete}
          >
            {isProcessing ? "Processing..." : "Confirm"}
          </button>
        </div>
      </CommonModal>
    </div>
  );
}
