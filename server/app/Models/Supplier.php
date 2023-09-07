<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        "id_supplier",
        "name",
        "RegisterDate",
        "address",
        "phone",
        "urlImage",
        "information",
    ];

    public function restock()
    {
        return $this->hasMany(Restock::class);
    }
    public function retur()
    {
        return $this->hasMany(Retur::class);
    }

    public function product()  
    {
        return $this->hasMany(Product::class);
    }
}
