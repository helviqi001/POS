<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Imports\ImportUnits;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
use Maatwebsite\Excel\Facades\Excel;

class UnitController extends Controller
{

    public $possible_fields = ["id", "name", "shortname", "created_at", "updated_at"];
    public $possible_relations = ["products"];

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
        $fields = $request->input('fields');

        $units = new Unit();

        if ($relations) {
            $units = handle_relations($relations, $this->possible_relations, $units);
        }

        if ($fields) {
            $units = handle_fields($fields, $this->possible_fields, $units);
        }

        if ($search) {
            $units = $units->where("name", "like", "%$search%")->orWhere("shortname", "like", "%$search%");
        }

        if ($paginate) return $units->paginate($paginate);

        return $units->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreUnitRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "unitName" => "required|string",
            "shortname" => "required|string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $newValue= Unit::create($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Unit name or Shortname already exists'], 500);
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
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {

        $relations = $request->input("relations");
        $fields = $request->input("fields");

        $unit = new Unit();

        if ($relations) {
            $unit = handle_relations($relations, $this->possible_relations, $unit);
        }

        if ($fields) {
            $unit = handle_fields($fields, $this->possible_fields, $unit);
        }

        return $unit->first();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateUnitRequest  $request
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "unitName" => "string",
            "shortname" => "string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $unit = Unit::findOrfail($request->id);
            $unit->update($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Unit name or Shortname already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$unit
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function destroy(Unit $unit)
    {
        $unit->delete();
        return response("", 204);
    }
    
    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportUnits,$file);
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
