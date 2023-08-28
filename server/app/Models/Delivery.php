<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;
    protected $fillable = [
        "fleet_id",
        "customer_id",
        "product_id",
        "deliveryDate",
        "information",
    ];

    public function customer(){
        return $this->belongsTo(Customer::class);
    }
    public function fleet(){
        return $this->belongsTo(Customer::class);
    }
    public function products(){
        return $this->belongsToMany(Product::class);
    }
}
