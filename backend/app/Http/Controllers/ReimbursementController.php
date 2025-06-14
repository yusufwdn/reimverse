<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Reimbursement;
use App\Models\User;
use App\Notifications\NewReimbursementNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReimbursementController extends Controller
{
    /**
     * Get list of user's reimbursements.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $reimbursements = $user->reimbursements()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($reimbursements);
    }

    /**
     * Create a new reimbursement request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'receipt' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $user = $request->user();
        $category = Category::findOrFail($request->category_id);

        // Check if the user has exceeded the monthly limit for this category
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $totalSpentThisMonth = Reimbursement::where('user_id', $user->id)
            ->where('category_id', $category->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where(function ($query) {
                $query->where('status', 'approved')
                    ->orWhere('status', 'pending');
            })
            ->sum('amount');

        if ($totalSpentThisMonth + $request->amount > $category->limit_per_month) {
            return response()->json([
                'message' => 'Monthly limit exceeded for this category',
                'limit' => $category->limit_per_month,
                'spent' => $totalSpentThisMonth,
                'remaining' => $category->limit_per_month - $totalSpentThisMonth,
            ], 422);
        }

        // Handle file upload
        $path = $request->file('receipt')->store('receipts', 'public');

        DB::beginTransaction();

        try {
            // Create reimbursement
            $reimbursement = new Reimbursement([
                'user_id' => $user->id,
                'category_id' => $request->category_id,
                'title' => $request->title,
                'description' => $request->description,
                'amount' => $request->amount,
                'status' => 'pending',
                'receipt_path' => $path,
                'submitted_at' => now(),
            ]);

            $reimbursement->save();

            // Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'reimbursement_id' => $reimbursement->id,
                'action' => 'created',
                'description' => 'Reimbursement request created',
            ]);

            // Notify managers
            $managers = User::where('role', 'manager')->get();
            foreach ($managers as $manager) {
                $manager->notify(new NewReimbursementNotification($reimbursement));
            }

            DB::commit();

            return response()->json([
                'message' => 'Reimbursement created successfully',
                'reimbursement' => $reimbursement->load('category'),
            ], 201);
        } catch (\Throwable $th) {
            DB::rollBack();

            // Delete the uploaded file if transaction fails
            Storage::disk('public')->delete($path);

            return response()->json([
                'message' => 'Failed to create reimbursement',
                'error' => $th->getMessage(),
            ], $th->getCode() != 0 ? $th->getCode() : 500);
        }
    }

    /**
     * Show the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $reimbursement = $user->reimbursements()
            ->with('category')
            ->findOrFail($id);

        return response()->json([
            'message' => 'Get Reimbursement by ID',
            'reimbursement' => $reimbursement->load('category')
        ]);
    }

    /**
     * Delete the specified resource.
     */
    public function delete(Request $request, string $id)
    {
        try {
            $user = $request->user();
            $reimbursement = Reimbursement::findOrFail($id);

            if ($user->role == 'admin' || $user->role != 'admin' && $user->id == $reimbursement->user_id) {
                // delete record
                $reimbursement->delete();
            } else {
                // prevent delete other user's reimbursment
                throw new \Exception('Record not found.', 404);
            }


            return response()->json([
                'message' => 'Reimbursement deleted successfully'
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Failed to delete reimbursement',
                'error' => $th->getMessage(),
            ], $th->getCode() != 0 ? $th->getCode() : 500);
        }
    }
}
