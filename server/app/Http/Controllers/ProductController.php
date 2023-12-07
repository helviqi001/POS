<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Imports\ImportProducts;
use App\Models\Category;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{   

    // public $possible_fields = ["id", "name", "cost", "price", "stock", "image", "created_at", "updated_at"];
    public $possible_relations = ["category", "unit", "supplier", "restocks","returns","transactions"];

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

        $products = new Product();

        if ($relations) {
            $products = handle_relations($relations, $this->possible_relations, $products);
        }

        // if ($fields) {
        //     $products = handle_fields($fields, $this->possible_fields, $products);
        // }

        if ($search) {
            $products = $products->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $products->paginate($paginate);

        return response()->json([
            "data"=>$products->get()
        ],Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreProductRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "idProduk" => "string",
            "name" => "required|string",
            "stock"=> "required|integer",
            "margin"=> "required|integer",
            "tax"=> "required|integer",
            "sellingPrice"=> "required|numeric|regex:/^\d+(\.\d{1,4})?$/",
            "discount"=> "required|integer",
            "netPrice"=> "required|integer",
            "coli"=> "required|integer",
            "information"=> "required|string",
            "unit_id"=> "required|integer",
            "supplier_id"=> "required|integer",
            "category_id"=> "required|integer",
            "urlImage" => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,gif'],
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        do {
            $randomNumber = rand(01, 9999);
            $category = Category::find($request->category_id); // Assuming you have a Category model
            $categoryName = $category->itemType;
            $idProduk = $categoryName .'-'. $randomNumber;
            $existingProduct = Product::where('idProduk', $idProduk)->first();
        } while ($existingProduct);
        $validated = $validator->validated();
        $validated["idProduk"] = $idProduk;
        $validated["urlImage"] = $request->file("urlImage")->store("product_image");

        try{
            $newValue= Product::create($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Product Name already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil dibuat",
            "data"=>$newValue,
        ],Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $relations = $request->input("relations");

        $product = new Product();

        if ($relations) {
            $product = handle_relations($relations, $this->possible_relations,  $product);
        }


        return $product->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateProductRequest  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "name" => "string",
            "stock"=> "integer",
            "margin"=> "integer",
            "tax"=> "integer",
            "sellingPrice"=> "numeric|regex:/^\d+(\.\d{1,4})?$/",
            "discount"=> "integer",
            "netPrice"=> "integer",
            "coli"=> "integer",
            "information"=> "string",
            "unit_id"=> "integer",
            "supplier_id"=> "integer",
            "restock_id"=> "integer",
            "category_id"=> "integer",
            "id"=>"integer",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $product = Product::findOrfail($request->id);
        if ($request->hasFile('urlImage')) {
            if($product->urlImage){
                Storage::delete($product->urlImage);
            }
            $validated["urlImage"] = $request->file("urlImage")->store("product_image");
        } 

        try{
            $product->update($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Product Name already exists'], 500);
            }
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
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(Product $product)
    {

        Storage::delete($product->urlImage);
        $product->delete();
        return response(null, 204);
    }

    public function MultipleDelete(Request $request)
    {
        $id = $request->input('id');
        $products = Product::whereIn('id', $id)->get();
        foreach ($products as $product) {
            Storage::delete($product->urlImage);
            
            $product->delete();
        }
         return response()->json([
            "message"=>"berhasil di delete"
        ],Response::HTTP_OK);
    }

    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportProducts,$file);
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
