<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historydelivery extends Model
{
    use HasFactory;
    protected $fillable = [
        "idDelivery",
        "fleet_id",
        "transaction_id",
        "deliveryDate",
        "deliveredDate",
        "information",
        "status",
    ];
    public function fleet(){
        return $this->belongsTo(Fleet::class);
    }
    public function transaction(){
        return $this->belongsTo(Transaction::class);
    }
    protected static function boot()
    {
        parent::boot();

        static::deleting(function($historydelivery){
            $historydelivery->transaction()->delete();
        });
    }
}
