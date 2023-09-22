<?php

namespace App\Http\Controllers;

use App\Models\historydelivery;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class historydeliveryController extends Controller
{
    public $possible_relations = ["fleet","fleet.staff","transaction","transaction.customer"];

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

        $delivery = new historydelivery();

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
        $validator = Validator::make($request->all(),[
            "idDelivery"=>'required|string',
            "fleet_id"=>"required|integer",
            "transaction_id"=>"required|integer",
            "deliveryDate"=>"required|date_format:Y-m-d H:i:s",
            "deliveredDate"=>"required|date_format:Y-m-d H:i",
            "status"=>"required|string",
            "information"=>"required|string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $newValue= historydelivery::create($validated);
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"Pengiriman selesai",
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

        $delivery = new historydelivery();

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
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "idDelivery"=>'string',
            "fleet_id"=>"integer",
            "transaction_id"=>"integer",
            "deliveryDate"=>"date_format:Y-m-d",
            "status"=>"status",
            "information"=>"string",
            "id"=>"integer",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $delivery= historydelivery::findOrfail($request->id);
        try{
            $delivery->update($validated);
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
    public function destroy(historydelivery $historydelivery)
    {
        $historydelivery->delete();
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
}
