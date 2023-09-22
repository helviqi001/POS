<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;
    protected $fillable = [
        "idDelivery",
        "fleet_id",
        "transaction_id",
        "deliveryDate",
        "information",
        "status",
    ];
    public function fleet(){
        return $this->belongsTo(Fleet::class);
    }
    public function transaction(){
        return $this->belongsTo(Transaction::class);
    }
}
