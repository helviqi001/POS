<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        "idProduk",
        "name",
        "urlImage",
        "stock",
        "margin",
        "tax",
        "sellingPrice",
        "discount",
        "netPrice",
        "coli",
        "information",
        "unit_id",
        "supplier_id",
        "category_id",
    ];

    public function category()
    {
        return $this->belongsTo(Category::class,'category_id','id');
    }
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
    public function returns()
    {
        return $this->belongsToMany(Returns::class);
    }
    public function restocks()
    {
        return $this->belongsToMany(Restock::class)->withPivot("quantity", "coli");
    }
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
    public function transactions(){
        return $this->belongsToMany(Transaction::class);
    }
}
