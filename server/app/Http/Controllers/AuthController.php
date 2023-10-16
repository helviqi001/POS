<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuthRequest;
use App\Models\Menugroup;
use App\Models\Menuitem;
use App\Models\Privilage;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function auth(AuthRequest $request)
    {
        $validated = $request->validated();

        $username = $validated["username"];
        $password = $validated["password"];

        $user = User::firstWhere("username", $username);

        if (!Hash::check($password, $user->password)) {
            return response([
                "message" => "The email or password entered is incorrect."
            ],Response::HTTP_BAD_REQUEST);
        }

        $token = $user->createToken("auth")->plainTextToken;

        $menus = Menugroup::withWhereHas('menuitem', function ($query) use ($user) {
            $query->withWhereHas('privilage',function ($subQuery) {
                $subQuery->where('view',1);
            });
        })->get();
        
        $result = [];
        
        foreach ($menus as $menu) {
            $result[] = [
                    'name' => $menu->name,
                    'icon' => $menu->icon,
                    'id'=>$menu->id,
                    'menuitem' => $menu->menuitem->map(function ($item) use ($user){
                        $privilege = $item->privilage->where('position_id',$user->staff->position_id)->first();
                        return [
                            'id'=>$item->id,
                            'name' => $item->name,
                            'icon' => $item->icon,
                            'url' => $item->url,
                            'privilege' => $privilege,
                        ];
                    }),
            ];
        }

        $setting = Setting::get();

        return response([
            "user" => $user,
            "privilage" => $result,
            "setting"=>$setting,
            "token" => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $user = User::find(auth("sanctum")->user()->id);
        $user->tokens()->delete();
    }

    // get authenticated user profile
    public function profile()
    {
        return auth("sanctum")->user();
    }
}
