<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Database\QueryException;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportUser implements ToModel,WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        try{
            User::create([
                "username" => $row["username"],
                "password" => bcrypt($row["password"]),
                "staff_id" => $row["staff_id"] ?? $row["staffid"],
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
                throw new \Exception('The username "' . $positionName . '" already exists');
            }
        }
    }
}
