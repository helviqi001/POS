<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Debit extends Model
{
    use HasFactory;

    protected $fillable= [
            "customer_id",
            "transaction_id",
            "nominal",
            "dueDate",
            "information",
            "status",
    ];

    public function customer(){
        return $this->belongsTo(Customer::class);
    }
    public function transaction(){
        return $this->belongsTo(Transaction::class);
    }
}
