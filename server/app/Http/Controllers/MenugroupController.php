<?php

namespace App\Http\Controllers;

use App\Models\Menugroup;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

class MenugroupController extends Controller
{
    public $possible_relations = ["menuitem"];
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

        $menugroup = new Menugroup();

        if ($relations) {
            $menugroup = handle_relations($relations, $this->possible_relations, $menugroup);
        }

        // if ($fields) {
        //     $products = handle_fields($fields, $this->possible_fields, $products);
        // }

        if ($search) {
            $menugroup = $menugroup->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $menugroup->paginate($paginate);

        return response()->json([
            "data"=>$menugroup->get()
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
            'name'=>'required|string',
            'icon'=>'required|string',
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $newValue= Menugroup::create($validated);
        }
        catch(\Exception $e){
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

        $menugroup = new Menugroup();

        if ($relations) {
            $menugroup = handle_relations($relations, $this->possible_relations,  $menugroup);
        }

        return $menugroup->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request,$id)
    {
       
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
            "icon"=> "string",
            "id"=>"integer",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $product = Menugroup::findOrfail($request->id);
        try{
            $product->update($validated);
        }
        catch(\Exception $e){
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }
        return response()->json([
            "message"=>"Data Berhasil Update",
            "data"=>$product
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Menugroup $menugroup)
    {
        $menugroup->delete();
        return response(null, 204);
    }
}
