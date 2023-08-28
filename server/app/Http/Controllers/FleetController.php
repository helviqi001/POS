<?php

namespace App\Http\Controllers;

use App\Models\Fleet;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class FleetController extends Controller
{
    public $possible_relations = ["staffs", "delivery"];

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
            "staff_id"=>"required|integer",   
            "vehicleType"=>"required|string",
            "plateNumber"=>"required|string",
            "informations"=>"required|string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $newValue= Fleet::create([ 
            "vehicleType"=>$validated["vehicleType"],
            "plateNumber"=>$validated["plateNumber"],
            "informations"=>$validated["informations"],
            ]);
            $newValue->staffs()->sync($validated["staff_id"]);
        }
        catch(\Exception $e){
            return $e;
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
            "staff_id"=>"integer",   
            "vehicleType"=>"string",
            "plateNumber"=>"string",
            "informations"=>"string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $fleet->update([
            "vehicleType"=>$validated["vehicleType"],
            "plateNumber"=>$validated["plateNumber"],
            "informations"=>$validated["informations"],
            ]);
            $fleet->staffs()->sync($validated["staff_id"]);
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"Data Berhasil dibuat",
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
}
