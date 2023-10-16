<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        "itemType"
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
    protected static function boot()
    {
        parent::boot();

        static::deleting(function($category){
            $category->products()->delete();
        });
    }
}
