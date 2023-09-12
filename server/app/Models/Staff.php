<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;
    protected $table = 'staffs';
    protected $fillable = [
        "id_staff",
        "name",
        "registerDate",
        "address",
        "phone",
        "position_id",
        "information",
    ];

    public function fleets(){
        return $this->belongsToMany(Fleet::class);
    }
    public function transaction(){
        return $this->hasMany(Transaction::class);
    }

    public function position(){
        return $this->belongsTo(Position::class);
    }
    public function user(){
        return $this->hasOne(User::class);
    }
}
