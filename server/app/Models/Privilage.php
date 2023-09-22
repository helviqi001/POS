<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Privilage extends Model
{
    use HasFactory;
    protected $fillable = [
        'position_id',
        'menuitem_id',
        'view',
        'add',
        'edit',
        'delete',
        'import',
        'export',
    ];

    public function menuitem()
    {
        return $this->belongsTo(Menuitem::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }
}
