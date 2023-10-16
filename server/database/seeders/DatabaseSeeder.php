<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Position;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Setting;
use App\Models\Staff;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $dataStaff= [
            [
                "id_staff"=>"SA-1242",
                "name"=>"Andreas",
                "registerDate"=>"2023-05-12",
                "address"=>"anyWhere",
                "phone"=>"081242124",
                "position_id"=>1,
                "information"=>"awdasadawaw",
            ]
            ];
        $dataPosition= [
            [
                "name"=>"Super Admin",
                "shortname"=>"SA",
            ]
            ];
        $data = [ 
            [
                "username"=>"superAdmin",
                "password"=>bcrypt("super123"),
                "staff_id"=>1,
            ],
        ];
        $setting = [ 
            [
                
            ],
            [
               
            ],
        ];
        Position::insert($dataPosition);
        Staff::insert($dataStaff);
        User::insert($data);
        Setting::insert($setting);
    }
}
