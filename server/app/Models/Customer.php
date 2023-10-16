<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $fillable = [
    "name",
    "registerDate",
    "birthDate",
    "address",
    "phone",
    "information",
    ];

    public function transaction(){
        return $this->hasMany(Transaction::class);
    }

    public function debit(){
        return $this->hasMany(Debit::class);
    }
    public function deposit(){
        return $this->hasMany(Deposit::class);
    }
    protected static function boot()
    {
        parent::boot();

        static::deleting(function($customer){
            $customer->debit()->delete();
            $customer->transaction()->delete();
            $customer->deposit()->delete();
        });
    }
}
