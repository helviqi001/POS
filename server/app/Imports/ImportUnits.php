<?php

namespace App\Imports;

use App\Models\Unit;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportUnits implements ToModel,WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Unit([
            "unitName"=>$row['unitname'] ?? $row['unit_name'] ?? $row['unit name'],
            "shortname"=>$row['shortname'] ?? $row['short_name'] ?? $row['short name'],
        ]);
    }
}
