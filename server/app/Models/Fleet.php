<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fleet extends Model
{
    use HasFactory;
    protected $fillable = [
        "staff_id",   
        "vehicleType",
        "plateNumber",
        "informations",
    ];

    public function staffs(){
        return $this->belongsToMany(Staff::class);
    }

    public function delivery(){
        return $this->hasMany(Delivery::class);
    }
}
