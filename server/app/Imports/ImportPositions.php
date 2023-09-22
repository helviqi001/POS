<?php

namespace App\Imports;

use App\Models\Position;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportPositions implements ToModel,WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $shortname = generateAbbreviation($row['positionname']);
        return new Position([
        "name"=>$row["positionname"],
        "shortname"=>$shortname,
        ]);
    }
}
