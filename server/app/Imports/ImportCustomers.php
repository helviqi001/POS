<?php

namespace App\Imports;

use App\Models\Customer;
use Illuminate\Database\QueryException;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportCustomers implements ToModel,WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $birthdate = $row['birthdate'] ?? $row['birth_date'];
        if (!$this->isValidDate($birthdate)) {
            throw new \Exception('Please birth date use format Year-month-day.');
        }
    
        // Validasi register date
        $registerDate = $row['registerdate'] ?? $row['register_date'];
        if (!$this->isValidDate($registerDate)) {
            throw new \Exception('Please register date use format Year-month-day.');
        }
        if (!preg_match('/^(0|8)\d{8,13}$/', $row['phone'])) {
            // Nomor telepon tidak memenuhi kriteria
            throw new \Exception('Phone'.$row['phone'].'isnt valid. it should have 9 - 13 digits and should be an integer');
        }
        $registerDate = date('Y-m-d', strtotime($row['registerdate'] ?? $row['register_date']));
        $birthDate = date('Y-m-d', strtotime($row['birthdate'] ?? $row['birth_date']));
        try{
            Customer::create([
                "name"=>$row['name'],
                "registerDate"=>$registerDate,
                "birthDate"=>$birthDate,
                "address"=>$row['address'],
                "phone"=>$row['phone'],
                "information"=>$row['phone'],
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
                throw new \Exception('The Customer Name "' . $positionName . '" already exists');
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

