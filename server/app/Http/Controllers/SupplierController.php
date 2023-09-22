<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Imports\ImportSuppliers;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class SupplierController extends Controller
{
    public $possible_relations = ["restock","product","retur","product.category","product.unit"];

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

        $suppliers = new Supplier();

        if ($relations) {
            $suppliers = handle_relations($relations, $this->possible_relations, $suppliers);
        }

        if ($search) {
            $suppliers = $suppliers->where("vat", $search)->orWhere("name", "like", "%" . $search . "%")->orWhere("email", "like", "%" . $search . "%")->orWhere("phone", "like", "%" . $search . "%");
        }

        if ($paginate) return $suppliers->paginate($paginate);

        return $suppliers->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreSupplierRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "id_supplier" => "string",
            "name" => "required|string",
            "RegisterDate" => "required|date_format:Y-m-d",
            "phone" => "required|string",
            "address" => "required|string",
            "urlImage" => ["required",File::image()],
            "information" => "required|string",
        ]);
        
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        do {
            $randomNumber = rand(1, 9999);
            $idSupplier = 'S-' . $randomNumber;
            $existingProduct = Supplier::where('id_supplier', $idSupplier)->first();
        } while ($existingProduct);
        $validated = $validator->validated();
        $validated["id_supplier"] = $idSupplier;
        $validated["urlImage"] = $request->file('urlImage')->store('supplier-image');
        try{
            $newValue = Supplier::create($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Supplier Name already exists'], 500);
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
     * @param  \App\Models\Supplier  $supplier
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $relations = $request->input("relations");
        $fields = $request->input("fields");

        $supplier = new Supplier();

        if ($relations) {
            $supplier = handle_relations($relations, $this->possible_relations, $supplier);
        }

        return $supplier->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateSupplierRequest  $request
     * @param  \App\Models\Supplier  $supplier
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "name" => "string",
            "RegisterDate" => "date_format:Y-m-d",
            "phone" => "string",
            "address" => "string",
            "information" => "string",
            "id"=>"integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $supplier = Supplier::findOrfail($request->id);
        if ($request->hasFile('urlImage')) {
            if($supplier->urlImage){
                Storage::delete($supplier->urlImage);
            }
            $validated["urlImage"] = $request->file('urlImage')->store('supplier-image');
        } 
        try{
            $supplier->update($validated);
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Supplier Name already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$supplier
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Supplier  $supplier
     * @return \Illuminate\Http\Response
     */
    public function destroy(Supplier $supplier)
    {
        Storage::delete($supplier->urlImage);
        $supplier->delete();
        return response()->json([
            "message"=>"Delete sucess"
        ],Response::HTTP_NO_CONTENT);
    }

    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportSuppliers,$file);
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
