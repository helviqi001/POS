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
        "urlImage",
        "registerDate",
        "address",
        "phone",
        "position_id",
        "information",
    ];

    public function fleets(){
        return $this->hasMany(Fleet::class);
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

    protected static function boot()
    {
        parent::boot();

        static::deleting(function($staff){
            $staff->fleets()->delete();
            $staff->user()->delete();
            $staff->transaction()->delete();
        });
    }
}
