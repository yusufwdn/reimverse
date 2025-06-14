<?php

namespace App\Http\Controllers;

use App\Models\Reimbursement;
use Illuminate\Http\Request;

class AdminReimbursementController extends Controller
{
    /**
     * Display a listing of the resource including soft deleted records.
     */
    public function index(Request $request)
    {
        $query = Reimbursement::with(['user', 'category']);

        // Filter by status if provided
        if ($request->has('status') && in_array($request->status, ['pending', 'approved', 'rejected'])) {
            $query->where('status', $request->status);
        }

        // Filter by user if provided
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by category if provided
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by date range if provided
        if ($request->has('from_date') && $request->from_date && $request->has('to_date') && $request->to_date) {
            $query->whereBetween('created_at', [$request->from_date, $request->to_date]);
        }

        // Check if we should include trashed records
        if ($request->has('with_trashed') && $request->with_trashed) {
            $query->withTrashed();
        }

        $reimbursements = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($reimbursements);
    }

    /**
     * Display the specified resource including if it's soft deleted.
     */
    public function show(Request $request, string $id)
    {
        $reimbursement = Reimbursement::withTrashed()
            ->with(['user', 'category'])
            ->findOrFail($id);

        return response()->json($reimbursement);
    }
}
