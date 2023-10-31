<?php

namespace App\Imports;

use App\Models\Fleet;
use App\Models\Staff;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportFleets implements ToModel,WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $staff = Staff::find($row['staff_id']);
        if (!$staff) {
            throw new \Exception('staff not found for staff_id: ' . $row['staff_id']);
        }
        do {
            $randomNumber = rand(1000, 9999);
            $idFleet = 'F'.'-'. $randomNumber;
            $existingProduct = Fleet::where('idFleet', $idFleet)->first();
        } while ($existingProduct);
        return new Fleet([
            "idFleet"=>$idFleet,
            "staff_id"=>$row['staff_id']??$row['staffid'],
            "plateNumber"=>$row['platenumber'] ?? $row['plate_number'],
            "informations"=>$row['information'] ?? $row['informations'],
        ]);
    }
}
