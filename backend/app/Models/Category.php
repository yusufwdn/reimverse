<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'limit_per_month',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'limit_per_month' => 'decimal:2',
    ];

    /**
     * Get the reimbursements for the category.
     */
    public function reimbursements(): HasMany
    {
        return $this->hasMany(Reimbursement::class);
    }
}
