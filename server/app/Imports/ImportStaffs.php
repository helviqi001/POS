<?php

namespace App\Imports;

use App\Models\Position;
use App\Models\Staff;
use Illuminate\Database\QueryException;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportStaffs implements ToModel, WithHeadingRow
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
        $position = Position::find($row['position_id']);
        if (!$position) {
            throw new \Exception('position not found for position_id: ' . $row['position_id']);
        }
        $registerDate = date('Y-m-d', strtotime($row['registerdate'] ?? $row['register_date']));

        do {
            $randomNumber = rand(1000, 9999);
            $position = Position::find($row['position_id']); // Assuming you have a Category model
            $positionName = $position->shortname;
            $idStaff = $positionName .'-'. $randomNumber;
            $existingProduct = Staff::where('id_staff', $idStaff)->first();
        } while ($existingProduct);
        try{
            Staff::create([
                "id_staff"=>$idStaff,
                "name"=>$row['name'],
                "phone"=>$row['phone'],
                "address"=>$row['address'],
                "urlImage"=>"null",
                "registerDate"=>$row['registerdate'] ?? $row['register_date'],
                "information"=>$row['information'],
                "position_id"=>$row['position_id'],
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
                throw new \Exception('The Staff Name "' . $positionName . '" already exists');
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
