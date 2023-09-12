<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class DeliveryController extends Controller
{
    public $possible_relations = ["fleet", "deliveries","customer"];

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

        $delivery = new Delivery();

        if ($relations) {
            $delivery = handle_relations($relations, $this->possible_relations, $delivery);
        }

        if ($search) {
            $delivery = $delivery->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $delivery->paginate($paginate);

        return response()->json([
            "data"=>$delivery->get()
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
        // $validator = Validator::make($request->all(),[
        //     "fleet_id"=>"required|integer",
        //     "customer_id"=>"required|integer",
        //     "transaction_id"=>"required|integer",
        //     "deliveryDate"=>"required|date_format:Y-m-d",
        //     "information"=>"required|string",
        // ]);
        // if($validator->fails()){
        //     return response()->json([
        //         "message"=>"error nih"
        //     ],Response::HTTP_BAD_REQUEST);
        // }
        // $validated = $validator->validated();
        // try{
        //     $newValue= Delivery::create([
        //     "fleet_id"=>$validated["fleet_id"],
        //     "customer_id"=>$validated["customer_id"],
        //     "deliveryDate"=>$validated["deliveryDate"],
        //     "information"=>$validated["information"],
        //     ]);
        //     $newValue->products()->sync($validated["product_id"]);
        // }
        // catch(\Exception $e){
        //     return $e;
        // }

        // return response()->json([
        //     "message"=>"Data Berhasil dibuat",
        //     "data"=>$newValue
        // ],Response::HTTP_OK);
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

        $delivery = new Delivery();

        if ($relations) {
            $delivery = handle_relations($relations, $this->possible_relations,  $delivery);
        }


        return $delivery->findOrFail($id);
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
    public function update(Request $request, Delivery $delivery)
    {
        $validator = Validator::make($request->all(),[
            "fleet_id"=>"integer",
            "transaction_id"=>"integer",
            "deliveryDate"=>"date_format:Y-m-d",
            "information"=>"string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $delivery->update([
            "fleet_id"=>$validated["fleet_id"],
            "deliveryDate"=>$validated["deliveryDate"],
            "transaction_id"=>$validated["transaction_id"],
            "information"=>$validated["information"],
            ]);
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$delivery
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy( Delivery $delivery)
    {
        $delivery->delete();
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
}
