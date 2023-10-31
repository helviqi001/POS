<?php

namespace App\Imports;

use App\Models\Menuitem;
use App\Models\Position;
use App\Models\Privilage;
use Illuminate\Database\QueryException;
use Illuminate\Http\Response;
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
        try{
            $shortname = generateAbbreviation($row['positionname']);
            $newValue = Position::create([
                "name" => $row["positionname"],
                "shortname" => $shortname,
            ]);
            if ($newValue) {
                // get all menu for insert privilege later
                $menuItems = Menuitem::get()->toArray();
                foreach ($menuItems as $keyX => $menuItem) {
                    // set param and default value to insert privilege
                    $privilege['position_id'] = $newValue->id;
                    $privilege['menuitem_id'] = $menuItem['id'];
                    $privilege['view'] = 0;
                    $privilege['add'] = 0;
                    $privilege['edit'] = 0;
                    $privilege['delete'] = 0;
                    $privilege['export'] = 0;
                    $privilege['import'] = 0;
                    // create privilege for new role
                    Privilage::create($privilege);
                }
            }
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                $errorMessage = $e->getMessage(); // Get the error message
                $positionName = null;
        
                // Extract the position name from the error message if it exists
                if (preg_match('/\'(.*?)\'/', $errorMessage, $matches)) {
                    $positionName = $matches[1];
                }
                throw new \Exception('The position name "' . $positionName . '" already exists');
            }
        }
    }
}
