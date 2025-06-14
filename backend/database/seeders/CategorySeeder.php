<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Transportasi',
                'limit_per_month' => 500000,
            ],
            [
                'name' => 'Kesehatan',
                'limit_per_month' => 1000000,
            ],
            [
                'name' => 'Makan',
                'limit_per_month' => 300000,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
