<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menugroup extends Model
{
    use HasFactory;
    protected $fillable=[
        'name',
        'icon',
    ];
    public function menuitem()
    {
        return $this->hasMany(Menuitem::class);
    }
}
