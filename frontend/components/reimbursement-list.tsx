import type { Reimbursement } from "@/types/reimbursement";

interface ReimbursementListProps {
  reimbursements: Reimbursement[];
}

export default function ReimbursementList({
  reimbursements,
}: ReimbursementListProps) {
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
          </tr>
        </thead>
        <tbody className="table-body">
          {reimbursements.map((reimbursement) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
