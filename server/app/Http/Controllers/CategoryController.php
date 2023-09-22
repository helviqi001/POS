<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Imports\ImportCategories;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request as Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class CategoryController extends Controller
{

    public $possible_fields = ["id", "name", "created_at", "updated_at"];
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

        $fields = $request->input("fields");
        $relations = $request->input("relations");

        $categories = new Category();

        if ($relations) {
            $categories = handle_relations($relations, $this->possible_relations, $categories);
        }

        if ($fields) {
            $fields = handle_fields($fields, $this->possible_fields, $fields);
        }

        if ($search) {
            $categories = $categories->where("name", "like", "%$search%");
        }

        if ($paginate) {
            return $categories->paginate($paginate);
        }

        return $categories->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreCategoryRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "itemType" => "required|string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $newValue= Category::create($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Item Type already exists'], 500);
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
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {

        $fields = $request->input("fields");
        $relations = $request->input("relations");

        $category = new Category();

        if ($relations) {
            $category = handle_relations($relations, $this->possible_relations, $category);
        }

        if ($fields) {
            $category = handle_fields($fields, $this->possible_fields, $category);
        }

        return $category->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateCategoryRequest  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "itemType" => "string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $unit = Category::findOrfail($request->id);
            $unit->update($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Item Type already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }


        return response()->json([
            "message"=>"Berhasil Update",
            "data"=>$unit
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response(null, 204);
    }

    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportCategories,$file);
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
