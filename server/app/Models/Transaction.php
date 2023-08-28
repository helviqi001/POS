<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        "staff_id",
        "customer_id",
        "product_id",
        "numberOfItemsOut",
        "total",
        "paymentStatus",
        "itemStatus",
        "information",
        "transactionDate",
        "kredit",
    ];

    public function products(){
        return $this->belongsToMany(Product::class);
    }

    public function staff(){
        return $this->belongsTo(Staff::class);
    }
    public function customer(){
        return $this->belongsTo(customer::class);
    }

}
