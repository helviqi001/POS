<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Unit;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportProducts implements ToModel,WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {   
        $supplier = Supplier::find($row['supplier_id']);
        if (!$supplier) {
            throw new \Exception('Supplier not found for supplier_id: ' . $row['supplier_id']);
        }
        $unit = Unit::find($row['unit_id']);
        if (!$unit) {
            throw new \Exception('Unit not found for Unit_id: ' . $row['supplier_id']);
        }
        $category = Category::find($row['category_id']);
        if (!$category) {
            throw new \Exception('category not found for category_id: ' . $row['category_id']);
        }
        do {
            $randomNumber = rand(01, 9999);
            $category = Category::find($row['category_id']); // Assuming you have a Category model
            $categoryName = $category->itemType;
            $idProduk = $categoryName .'-'. $randomNumber;
            $existingProduct = Product::where('idProduk', $idProduk)->first();
        } while ($existingProduct);
        $sellingPrice = $row['netprice']?? $row['net_price'] + ($row['netprice']?? $row['net_price'] * ($row['margin'] / 100))  + ($row['netprice']?? $row['net_price']*($row['tax']/100));
        return new Product([
            "idProduk"=>$idProduk,
            "name"=>$row['name'],
            "urlImage"=>"null",
            "stock"=>$row['stock'],
            "margin"=>$row['margin'],
            "tax"=>$row['tax'],
            "sellingPrice"=>$sellingPrice,
            "discount"=>$row['discount'],
            "netPrice"=>$row['netprice']?? $row['net_price'],
            "coli"=>$row['coli'],
            "information"=>$row['information'],
            "unit_id"=>$row['unit_id'],
            "supplier_id"=>$row['supplier_id'],
            "category_id"=>$row['category_id'],
        ]);
    }
}
