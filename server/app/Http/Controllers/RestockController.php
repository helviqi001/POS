<?php

namespace App\Http\Controllers;

use App\Imports\ImportRestocks;
use App\Models\Product;
use App\Models\Restock;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
use Maatwebsite\Excel\Facades\Excel;

class RestockController extends Controller
{

    public $possible_relations = ["supplier", "products",];
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

        $products = new Restock();

        if ($relations) {
            $products = handle_relations($relations, $this->possible_relations, $products);
        }

        if ($search) {
            $products = $products->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $products->paginate($paginate);

        return response()->json([
            "data"=>$products->get()
        ],Response::HTTP_OK);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        
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
            "idRestock"=>"integer",
            "product_id.*.quantity"=>"required|integer",
            "restockDate"=>"required|date_format:Y-m-d H:i",
            "totalSpend"=>"required|numeric|regex:/^\d+(\.\d{1,4})?$/",
            "product_id.*.coli"=>"required|integer",
            "product_id"=>"required|array",
            "product_id.*.id"=>"integer",
            "supplier_id"=>"required|integer",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors(),
            ],Response::HTTP_BAD_REQUEST);
        }
        do {
            $randomNumber = rand(01, 9999);
            $idRestock = 'Restock'.'-'. $randomNumber;
            $existingProduct = Restock::where('idRestock', $idRestock)->first();
        } while ($existingProduct);
        $validated = $validator->validated();
        $validated['idRestock'] = $idRestock;
        $products = $this->convert_array($validated["product_id"]);
        try{
            $newValue= Restock::create([
                "idRestock"=>$validated['idRestock'],
                'restockDate'=>$validated['restockDate'],
                'totalSpend'=>$validated['totalSpend'],
                'supplier_id'=>$validated['supplier_id'],
            ]);
            $newValue->products()->sync($products);
            // Update stock for each product
            foreach ($products as $key => $product) {
                $productModel = Product::firstWhere("id",$key);
                $productModel->stock += $product['quantity'];
                $productModel->coli += $product['coli'];
                $productModel->save(); 
            }
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

        $restock = new Restock();

        if ($relations) {
            $restock = handle_relations($relations, $this->possible_relations,  $restock);
        }


        return $restock->findOrFail($id);
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
            "product_id.*.quantity"=>"integer",
            "totalSpend"=>"numeric|regex:/^\d+(\.\d{1,4})?$/",
            "product_id.*.coli"=>"integer",
            "product_id"=>"array",
            "product_id.*.id"=>"integer",
            "supplier_id"=>"integer",
            "id"=>"integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors(),
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $products = $this->convert_array($validated["product_id"]);
        try{
            $restock = Restock::findOrfail($request->id);
            foreach ($products as $key => $product) {
                $productModel = Product::firstWhere("id",$key);
                $oldQuantity = $restock->products()->where('product_id', $key)->first()->pivot->quantity;
                $oldColi = $restock->products()->where('product_id', $key)->first()->pivot->coli;
                
                $productModel->stock -= $oldQuantity;
                $productModel->stock += $product['quantity'];
                $productModel->coli -= $oldColi;
                $productModel->coli += $product['coli'];
                $productModel->save(); 
            }
            $restock->update([
            'restockDate'=>$request->restockDate,
            'totalSpend'=>$validated['totalSpend'],
            'supplier_id'=>$validated['supplier_id'],
            ]);
            $restock->products()->sync($products);
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$restock
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Restock $restock)
    {
        try{
            $pivotRestock = $restock->products;
            foreach($pivotRestock as $product){
                $productModel = Product::findOrFail($product['id']);
                    $oldQuantity = $restock->products()->where('product_id', $product['id'])->first()->pivot->quantity;
                    $productModel->stock -= $oldQuantity;
                    $oldColi = $restock->products()->where('product_id', $product['id'])->first()->pivot->coli;
                    $productModel->coli -= $oldColi;
                    $productModel->save(); 
            }
            $restock->delete();
        }
        catch(\Exception $e){
            return response()->json([
                "message"=>$e
            ],Response::HTTP_OK);
        }
        // $restock->delete();
        return response()->json([
            "message"=>"berhasil di delete"
        ],Response::HTTP_OK);
    }

    public function MultipleDelete(Request $request)
    {
        $id = $request->input('id');
        $restocks = Restock::whereIn('id',$id)->get();
        try{
            foreach($restocks as $restock){
                $pivotRestock = $restock->products;
                foreach($pivotRestock as $product){
                    $productModel = Product::findOrFail($product['id']);
                        $oldQuantity = $restock->products()->where('product_id', $product['id'])->first()->pivot->quantity;
                        $productModel->stock -= $oldQuantity;
                        $oldColi = $restock->products()->where('product_id', $product['id'])->first()->pivot->coli;
                        $productModel->coli -= $oldColi;
                        $productModel->save(); 
                }
                $restock->delete();
            }
        }
        catch(\Exception $e){
            return response()->json([
                "message"=>$e
            ],Response::HTTP_OK);
        }
        // $restock->delete();
        return response()->json([
            "message"=>"berhasil di delete"
        ],Response::HTTP_OK);
    }

    public function convert_array(array $data)
    {
        $result = [];
        foreach ($data as $piece) {
            $result[$piece["id"]] = [];

            if ($piece["quantity"] ?? false) {
                $result[$piece["id"]]["quantity"] = $piece["quantity"];
            }

            if ($piece["coli"] ?? false) {
                $result[$piece["id"]]["coli"] = $piece["coli"];
            }
        }
        return $result;
    }

    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportRestocks,$file);
        }catch(\Exception $e){
            return response()->json([
                "error"=>$e->getMessage()
            ],Response::HTTP_BAD_REQUEST);
        }
        return response()->json([
            'message'=>"berhasil Import"
        ],Response::HTTP_OK);
    }
}
