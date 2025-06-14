<?php

use App\Http\Controllers\AdminReimbursementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ManagerReimbursementController;
use App\Http\Controllers\ReimbursementController;
use Illuminate\Support\Facades\Route;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Common routes
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Employee routes
    Route::middleware('role:employee,manager,admin')->group(function () {
        Route::get('/reimbursements', [ReimbursementController::class, 'index']);
        Route::post('/reimbursements', [ReimbursementController::class, 'store']);
        Route::get('/reimbursements/{id}', [ReimbursementController::class, 'show']);
        Route::delete('/reimbursements/{id}', [ReimbursementController::class, 'delete']);
    });
    
    // Manager routes
    Route::middleware('role:manager,admin')->prefix('manager')->group(function () {
        Route::get('/reimbursements', [ManagerReimbursementController::class, 'index']);
        Route::post('/reimbursements/{id}/approve', [ManagerReimbursementController::class, 'approve']);
        Route::post('/reimbursements/{id}/reject', [ManagerReimbursementController::class, 'reject']);
    });
    
    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Category
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'delete']);

        // Reimburse
        Route::get('/reimbursements', [AdminReimbursementController::class, 'index']);
        Route::get('/reimbursements/{id}', [AdminReimbursementController::class, 'show']);
    });
});
