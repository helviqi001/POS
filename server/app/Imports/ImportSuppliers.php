<?php

namespace App\Imports;

use App\Models\Supplier;
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
        return new Supplier([
            "id_supplier"=>$idSupplier,
            "name"=>$row['name'],
            "RegisterDate"=>$row['register_date'] ?? $row['registerdate'],
            "address"=>$row['address'],
            "phone"=>$row['phone'],
            "urlImage"=>'null',
            "information"=>$row['information'],
        ]);
    }
    private function isValidDate($date)
    {
        $format = 'Y-m-d';
        $dateTimeObj = \DateTime::createFromFormat($format, $date);
        return $dateTimeObj && $dateTimeObj->format($format) === $date;
    }
}
