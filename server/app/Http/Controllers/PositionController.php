<?php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{

    public $possible_relations = ["category", "unit", "supplier", "restocks","returns","transaction","deliveries"];
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

        $Position = new Position();

        if ($relations) {
            $Position = handle_relations($relations, $this->possible_relations, $Position);
        }

        // if ($fields) {
        //     $products = handle_fields($fields, $this->possible_fields, $products);
        // }

        if ($search) {
            $Position = $Position->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $Position->paginate($paginate);

        return response()->json([
            "data"=>$Position->get()
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
            "name" => "required|string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();

        try{
            $newValue= Position::create($validated);
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
    public function show(Request $request ,$id)
    {
        $relations = $request->input("relations");

        $Position = new Position();

        if ($relations) {
            $Position = handle_relations($relations, $this->possible_relations,  $Position);
        }


        return $Position->findOrFail($id);
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
            "name" => "string",
            "id"=>"integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $Position = Position::findOrfail($request->id);

        try{
            $Position->update($validated);
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"Berhasil Update",
            "data"=>$Position
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Position $position)
    {
        $position->delete();
        return response(null, 204);
    }
}
