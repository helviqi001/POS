<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Retur extends Model
{
    use HasFactory;
    protected $fillable = [
        "idRetur",
        "returnDate",
        "totalSpend",
        "product_id",
        "supplier_id",
    ];
    public function supplier()  {
        return $this->belongsTo(Supplier::class);
    }
    public function products()  {
        return $this->belongsToMany(Product::class)->withPivot("quantity", "coli");
    }
}
