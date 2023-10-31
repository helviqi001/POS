<?php

namespace App\Imports;

use App\Models\Supplier;
use Illuminate\Database\QueryException;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportSuppliers implements ToModel,WithHeadingRow
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        $registerDate = $row['registerdate'] ?? $row['register_date'];
        if (!$this->isValidDate($registerDate)) {
            throw new \Exception('Please use format Year-month-day.');
        }
        do {
            $randomNumber = rand(1, 9999);
            $idSupplier = 'S-' . $randomNumber;
            $existingProduct = Supplier::where('id_supplier', $idSupplier)->first();
        } while ($existingProduct);
        try{
            Supplier::create([
                "id_supplier"=>$idSupplier,
                "name"=>$row['name'],
                "RegisterDate"=>$row['register_date'] ?? $row['registerdate'],
                "address"=>$row['address'],
                "phone"=>$row['phone'],
                "urlImage"=>'null',
                "information"=>$row['information'],
                ]);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                $errorMessage = $e->getMessage(); // Get the error message
                $positionName = null;
        
                // Extract the position name from the error message if it exists
                if (preg_match('/\'(.*?)\'/', $errorMessage, $matches)) {
                    $positionName = $matches[1];
                }
                throw new \Exception('The Supplier Name "' . $positionName . '" already exists');
            }
        }
    }
    private function isValidDate($date)
    {
        $format = 'Y-m-d';
        $dateTimeObj = \DateTime::createFromFormat($format, $date);
        return $dateTimeObj && $dateTimeObj->format($format) === $date;
    }
}
