"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import ReimbursementForm from "@/components/reimbursement-form";
import ReimbursementList from "@/components/reimbursement-list";
import type { Reimbursement } from "@/types/reimbursement";
import { useRouter } from "next/navigation";

export default function EmployeeDashboard() {
  const { user, token } = useAuth();
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchReimbursements = async () => {
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
      if (!user) {
        router.push("/");
      }
    }

    if (token) {
      fetchReimbursements();
    }
  }, [token, showForm]);

  const handleNewReimbursement = (newReimbursement: Reimbursement) => {
    setReimbursements([newReimbursement, ...reimbursements]);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Employee Dashboard
          </h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "New Reimbursement"}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h2 className="text-lg font-medium mb-4">
              Submit New Reimbursement
            </h2>
            <ReimbursementForm onSuccess={handleNewReimbursement} />
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-medium mb-4">
            Your Reimbursement Requests
          </h2>

          {isLoading ? (
            <p>Loading your reimbursements...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : reimbursements.length === 0 ? (
            <p>{`You haven't submitted any reimbursement requests yet`}.</p>
          ) : (
            <ReimbursementList reimbursements={reimbursements} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
