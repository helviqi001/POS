<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fleet extends Model
{
    use HasFactory;
    protected $fillable = [
        "idFleet",
        "staff_id",
        "plateNumber",
        "informations",
    ];

    public function staff(){
        return $this->belongsTo(Staff::class);
    }

    public function delivery(){
        return $this->hasMany(Delivery::class);
    }
}
