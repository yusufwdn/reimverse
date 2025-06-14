<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get list of categories.
     */
    public function index(Request $request)
    {
        $category = Category::orderBy('created_at', 'desc')->paginate(50);

        return response()->json($category);
    }

    /**
     * Create a new category.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'limit_per_month' => 'required|numeric|min:0',
        ]);

        try {
            // Create new category
            $category = Category::create([
                'name'=> $request->name,
                'limit_per_month'=> $request->limit_per_month,
            ]);

            return response()->json([
                'message' => 'Category created successfully',
                'category' => $category
            ], 201);
        } catch (\Throwable $th) {

            return response()->json([
                'message' => 'Failed to create category',
                'error' => $th->getMessage(),
            ], $th->getCode() != 0 ? $th->getCode() : 500);
        }
    }

    /**
     * Update existing category.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'limit_per_month' => 'required|numeric|min:0',
        ]);

        try {
            // Find and update category
            $category = Category::findOrFail($id);
            $category->update([
                'name'=> $request->name,
                'limit_per_month'=> $request->limit_per_month,
            ]);

            return response()->json([
                'message' => 'Category updated successfully',
                'category' => $category,
            ], 201);
        } catch (\Throwable $th) {

            return response()->json([
                'message' => 'Failed to update category',
                'error' => $th->getMessage(),
            ], $th->getCode() != 0 ? $th->getCode() : 500);
        }
    }

    /**
     * Show the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        return response()->json([
            'message' => 'Get category by ID',
            'category' => $category
        ]);
    }

    /**
     * Delete the specified resource.
     */
    public function delete(Request $request, string $id)
    {
        try {
            // delete category when exist
            Category::findOrFail($id)?->delete();

            return response()->json([
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Failed to delete category',
                'error' => $th->getMessage(),
            ], $th->getCode() != 0 ? $th->getCode() : 500);
        }
    }
}
