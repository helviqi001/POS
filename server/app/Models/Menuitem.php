<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menuitem extends Model
{
    use HasFactory;
    protected $fillable=[
        'name',
        'url',
        'icon',
        'menugroup_id',
    ];
    public function menugroup()
    {
        return $this->belongsTo(MenuGroup::class);
    }
    public function privilage()
    {
        return $this->hasMany(Privilage::class);
    }
}
