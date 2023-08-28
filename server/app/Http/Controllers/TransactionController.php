<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public $possible_relations = ["staff","kredit","customer","products"] ; 
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

        $transaction = new Transaction();

        if ($relations) {
            $transaction = handle_relations($relations, $this->possible_relations, $transaction);
        }

        if ($search) {
            $transaction = $transaction->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $transaction->paginate($paginate);

        return response()->json([
            "data"=>$transaction->get()
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
            "customer_id"=>"required|integer",
            "product_id"=>"required|array",
            "product_id.*"=>"integer",
            "numberOfItemsOut"=>"required|integer",
            "total"=>"required|integer",
            "paymentStatus"=>"string",
            "itemStatus"=>"string",
            "information"=>"required|string",
            "transaction_date"=>"required|date_format:Y-m-d",
        ]);
        if($validator->fails()){
            return response()->json([
                "error"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validate();
        $validated['paymentStatus'] = "Berhasil";
        $validated['information'] = "Cash";
        try{
            $newValue= Transaction::create([
                'staff_id'=>$validated['staff_id'],
                'customer_id'=>$validated['customer_id'],
                'numberOfItemsOut'=>$validated['numberOfItemsOut'],
                'total'=>$validated['total'],
                'paymentStatus'=>$validated['paymentStatus'],
                'itemStatus'=>$validated['itemStatus'],
                'information'=>$validated['information'],
                'transaction_date'=>$validated['transaction_date'],
            ]);
            $newValue->products()->sync($validated['product_id']);  
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

        $transaction = new Transaction();

        if ($relations) {
            $transaction = handle_relations($relations, $this->possible_relations,  $transaction);
        }


        return $transaction->findOrFail($id);
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
            "staff_id"=>"integer",
            "customers_id"=>"integer",
            "product_id"=>"array",
            "product_id.*"=>"integer",
            "numberOfItemsOut"=>"integer",
            "total"=>"integer",
            "paymentStatus"=>"string",
            "itemStatus"=>"string",
            "information"=>"string",
            "transaction_date"=>"date_format:Y-m-d",
            "id"=>"integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "error"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validate();
        $validated['paymentStatus'] = "Berhasil";
        $validated['information'] = "Cash";
        try{
            $transaction = Transaction::findOrfail($request->id);
            $transaction->update([
                'staff_id'=>$validated['staff_id'],
                'customers_id'=>$validated['customers_id'],
                'numberOfItemsOut'=>$validated['numberOfItemsOut'],
                'total'=>$validated['total'],
                'paymentStatus'=>$validated['paymentStatus'],
                'itemStatus'=>$validated['itemStatus'],
                'information'=>$validated['information'],
                'transaction_date'=>$validated['transaction_date'],
            ]);
            $transaction->products()->sync($validated['product_id']);  
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"Data Berhasil diupdate",
            "data"=>$transaction
        ],Response::HTTP_OK);

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
}
