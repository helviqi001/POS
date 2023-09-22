<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Retur;
use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportReturs implements ToModel,WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $productIds = explode(',', $row['product_id']);
        $productQuantity = explode(',', $row['quantity']);
        $productColi = explode(',', $row['coli']);
        $totalSpend = 0;

        foreach($productIds as $index => $pi){
            $product = Product::find($pi);
            if (!$product) {
                throw new \Exception('product not found for product_id: ' . $pi);
            }
            $totalSpend += $product->netPrice * $productQuantity[$index];
        }
        $supplier = Supplier::find($row['supplier_id']);
        if (!$supplier) {
            throw new \Exception('supplier not found for supplier_id: ' . $row['supplier_id']);
        }
        do {
            $randomNumber = rand(01, 9999);
            $idRetur = 'Return'.'-'. $randomNumber;
            $existingProduct = Retur::where('idRetur', $idRetur)->first();
        } while ($existingProduct);
        $restock =new Retur([
            "idRetur"=>$idRetur,
            "returnDate"=>$row['returndate'] ?? $row['return_date'],
            "totalSpend"=>$totalSpend,
            "supplier_id"=>$row['supplier_id'],
        ]);
        $restock->save();

        foreach ($productIds as $index => $productId) {
            $productModel = Product::find($productId);
    
            $restock->products()->attach($productModel, [
                'quantity' => $productQuantity[$index],
                'coli' => $productColi[$index],
            ]);
            $productModel->stock -= $productQuantity[$index];
                $productModel->coli -= $productColi[$index];
                $productModel->save(); 
        }
        
    }
}
