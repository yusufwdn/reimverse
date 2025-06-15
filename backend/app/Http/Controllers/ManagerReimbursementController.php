<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Reimbursement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManagerReimbursementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $reimbursements = Reimbursement::with(['user', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($reimbursements);
    }

    /**
     * Approve a reimbursement.
     */
    public function approve(Request $request, string $id)
    {
        $manager = $request->user();
        $reimbursement = Reimbursement::findOrFail($id);

        
        if ($reimbursement->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending reimbursements can be approved',
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            $reimbursement->status = 'approved';
            $reimbursement->approved_at = now();
            $reimbursement->save();
            
            // Log activity
            ActivityLog::create([
                'user_id' => $manager->id,
                'reimbursement_id' => $reimbursement->id,
                'action' => 'approved',
                'description' => 'Reimbursement request approved',
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Reimbursement approved successfully',
                'reimbursement' => $reimbursement->load(['user', 'category']),
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to approve reimbursement',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject a reimbursement.
     */
    public function reject(Request $request, string $id)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);
        
        $manager = $request->user();
        $reimbursement = Reimbursement::findOrFail($id);
        
        if ($reimbursement->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending reimbursements can be rejected',
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            $reimbursement->status = 'rejected';
            $reimbursement->reason = $request->reason;
            $reimbursement->save();
            
            // Log activity
            ActivityLog::create([
                'user_id' => $manager->id,
                'reimbursement_id' => $reimbursement->id,
                'action' => 'rejected',
                'description' => 'Reimbursement request rejected reason: ' . $request->reason,
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Reimbursement rejected successfully',
                'reimbursement' => $reimbursement->load(['user', 'category']),
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to reject reimbursement',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
}
