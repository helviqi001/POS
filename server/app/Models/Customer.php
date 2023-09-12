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

    public function delivery(){
        return $this->hasMany(Delivery::class);
    }

    public function transaction(){
        return $this->hasMany(Transaction::class);
    }

    public function debit(){
        return $this->hasMany(Debit::class);
    }
}
