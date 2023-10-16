<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{

    public $possible_fields = ["id", "name", "shortname", "created_at", "updated_at"];
    public $possible_relations = ["staff"];

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $relation = $request->input("relations");

        $users = new User();


        if ($relation) {
            $users = handle_relations($relation, $this->possible_relations, $users);
        }
    
        return $users->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        try{
            $user = User::create([
                "username" => $validated["username"],
                "password" => bcrypt($validated["password"]),
                "staff_id" => $validated["staff_id"],
            ]);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Username already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil dibuat",
            "data"=>$user
        ],Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(request $request,$id)
    {
        $relation = $request->input("relations");
        $user = new User();
        if ($relation) {
            $user = handle_relations($relation, $this->possible_relations, $user);
        }
        
        return $user->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "username" => "string",
            "staff_id" => "integer",
            "id" => "integer",
        ]);
        $validated = $validator->validated();
        $user = User::findOrfail($request->id);
        if (!Hash::check($request->input("oldPassword"), $user->password)) {
            return response()->json(['error' => 'Old password is incorrect'], 500);
        }        
        try{
            $user->update([
                "username" => $validated["username"],
                "password" => bcrypt($request->input("newPassword")),
                "staff_id" => $validated["staff_id"],
            ]);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Username already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil diupdate",
            "data"=>$user
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response("", 204);
    }
    public function MultipleDelete(Request $request)
    {
        $id = $request->input('id');
        $users = User::whereIn('id', $id)->get();
        foreach ($users as $user) {
            $user->delete();
        }
        return response()->json([
            "message"=>"berhasil di delete"
        ],Response::HTTP_OK);
    }
    public function ForgetPassword(Request $request){
        $user = User::firstWhere("username",$request->input("username"));
        if(!$user){
            return response()->json(['error' => 'Username Not Found'], 500);
        }     
        if($request->input("newPassword") !== $request->input("confirmPassword")){
            return response()->json(['error' => 'Your New Password and Confirm Password isn`t same'], 500);
        }
        try{
            $user->update([
                "username" => $user->username,
                "password" => bcrypt($request->input("newPassword")),
                "staff_id" => $user->staff_id,
            ]);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Username already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil diupdate",
            "data"=>$user
        ],Response::HTTP_OK);
    }
}
