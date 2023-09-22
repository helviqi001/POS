<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    use HasFactory;
    protected $fillable = [
        "idDeposit",
        "customer_id",
        "transaction_id",
        "depositDate",
        "total",
        "ammount",
        "status",
        "information",
    ];

    public function customer(){
        return $this->belongsTo(Customer::class);
    }
    public function transaction(){
        return $this->belongsTo(Transaction::class);
    }
}
