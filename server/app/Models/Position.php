<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;
    protected $fillable = [
        "name",
        "shortname",
    ];
    public function staff(){
        return $this->hasMany(Staff::class);
    }
    public function privilage()
    {
        return $this->hasMany(Privilage::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function($position){
            $position->staff()->delete();
        });
    }
}
