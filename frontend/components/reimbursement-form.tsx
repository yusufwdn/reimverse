"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import type { Category, Reimbursement } from "@/types/reimbursement";

interface ReimbursementFormProps {
  onSuccess: (reimbursement: Reimbursement) => void;
}

export default function ReimbursementForm({
  onSuccess,
}: ReimbursementFormProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reimbursements");
        }

        const result = await response.json();
        const categories = result.data;

        // console.log(categories, "categories");

        setCategories(categories);
      } catch (error) {
        console.error(error);
      }
    };

    getCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !amount || !category || !file) {
      setError("All fields are required");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB limit");
      return;
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("amount", amount);
      formData.append("category_id", category);
      formData.append("receipt", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reimbursements`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log(errorResponse, "errorResponse");
        throw new Error(
          errorResponse.message ?? "Failed to submit reimbursement request"
        );
      }

      const newReimbursement = await response.json();
      onSuccess(newReimbursement);

      // Reset form
      setTitle("");
      setDescription("");
      setAmount("");
      setCategory("");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          className="form-input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="form-label">
            Amount (Rp)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category: Category, index) => (
              <option value={category.id} key={index}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="receipt" className="form-label">
          Receipt (PDF, JPG, PNG - Max 2MB)
        </label>
        <input
          id="receipt"
          type="file"
          className="form-input"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          required
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
