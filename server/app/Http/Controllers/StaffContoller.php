<?php

namespace App\Http\Controllers;

use App\Imports\ImportStaffs;
use App\Models\Position;
use App\Models\Staff;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class StaffContoller extends Controller
{
    public $possible_relations = ["fleets", "transaction","position"];
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $paginate = $request->input("paginate");
        $search = $request->input("search");
        $relations = $request->input("relations");
        // $fields = $request->input("fields");

        $staff = new Staff();

        if ($relations) {
            $staff = handle_relations($relations, $this->possible_relations, $staff);
        }

        if ($search) {
            $staff = $staff->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $staff->paginate($paginate);

        return response()->json([
            "data"=>$staff->get()
        ],Response::HTTP_OK);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "id_staff"=>"string",
            "name"=>"required|string",
            "registerDate"=>"required|date_format:Y-m-d",
            "name"=>"required|string",
            "address"=>"required|string",
            "phone"=>"required|string",
            "information"=>"required|string",
            "position_id"=>"required|integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        do {
            $randomNumber = rand(1000, 9999);
            $position = Position::find($request->position_id); // Assuming you have a Category model
            $positionName = $position->shortname;
            $idStaff = $positionName .'-'. $randomNumber;
            $existingProduct = Staff::where('id_staff', $idStaff)->first();
        } while ($existingProduct);
        $validated = $validator->validated();
        $validated['id_staff'] = $idStaff;
        try{
            $newValue= Staff::create($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Staff Name already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }
        return response()->json([
            "message"=>"Data Berhasil dibuat",
            "data"=>$newValue
        ],Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request,$id)
    {
        $relations = $request->input("relations");

        $staff = new Staff();

        if ($relations) {
            $staff = handle_relations($relations, $this->possible_relations,  $staff);
        }


        return $staff->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
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
            "name"=>"string",
            "registerDate"=>"date_format:Y-m-d",
            "position_id"=>"integer",
            "address"=>"string",
            "phone"=>"string",
            "information"=>"string",
            
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();

        try{
            $staff = Staff::findOrfail($request->id);
            $staff->update($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Staff Name already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$staff
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Staff $staff)
    {
        $staff->delete();
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }

    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportStaffs,$file);
        }catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => $e], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }
        return response()->json([
            'message'=>"berhasil Import"
        ],Response::HTTP_OK);
    }
    
}
