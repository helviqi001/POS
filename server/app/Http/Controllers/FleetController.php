<?php

namespace App\Http\Controllers;

use App\Imports\ImportFleets;
use App\Models\Fleet;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class FleetController extends Controller
{
    public $possible_relations = ["staff", "delivery","staff.position"];

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

        $fleet = new Fleet();

        if ($relations) {
            $fleet = handle_relations($relations, $this->possible_relations, $fleet);
        }

        if ($search) {
            $fleet = $fleet->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $fleet->paginate($paginate);

        return response()->json([
            "data"=>$fleet->get()
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
            "idFleet"=>"string",
            "staff_id"=>"required|integer", 
            "plateNumber"=>"required|string",
            "informations"=>"required|string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        do {
            $randomNumber = rand(1000, 9999);
            $idFleet = 'F'.'-'. $randomNumber;
            $existingProduct = Fleet::where('idFleet', $idFleet)->first();
        } while ($existingProduct);
        $validated = $validator->validated();
        $validated['idFleet'] = $idFleet;
        try{
            $newValue= Fleet::create($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Customer Name already exists'], 500);
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

        $fleet = new Fleet();

        if ($relations) {
            $fleet = handle_relations($relations, $this->possible_relations,  $fleet);
        }


        return $fleet->findOrFail($id);
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
    public function update(Request $request, Fleet $fleet)
    {
        $validator = Validator::make($request->all(),[
            "idFleet"=>"string",
            "staff_id"=>"integer",   
            "plateNumber"=>"string",
            "informations"=>"string",
            "id"=>"integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $fleet = Fleet::findOrfail($request->id);
        try{
            $fleet->update($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Customer Name already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$fleet
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy( Fleet $fleet)
    {
        $fleet->delete();
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }

    public function MultipleDelete(Request $request)
    {
        $id = $request->input('id');
        $fleets = Fleet::whereIn('id', $id)->get();
        foreach ($fleets as $fleet) {
            $fleet->delete();
        }
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportFleets,$file);
        }catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => $e], 500);
            }
        }
        return response()->json([
            'message'=>"berhasil Import"
        ],Response::HTTP_OK);
    }
}
