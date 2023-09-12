<?php

namespace App\Http\Controllers;

use App\Models\Debit;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class DebitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public $possible_relations = ["customer","transaction"];

    public function index(Request $request)
    {
        $paginate = $request->input("paginate");
        $search = $request->input("search");
        $relations = $request->input("relations");
        // $fields = $request->input("fields");

        $Debit = new Debit();

        if ($relations) {
            $Debit = handle_relations($relations, $this->possible_relations, $Debit);
        }

        // if ($fields) {
        //     $Debit = handle_fields($fields, $this->possible_fields, $Debit);
        // }

        if ($search) {
            $Debit = $Debit->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $Debit->paginate($paginate);

        return response()->json([
            "data"=>$Debit->get()
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
        //
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

        $Debit = new Debit();

        if ($relations) {
            $Debit = handle_relations($relations, $this->possible_relations,  $Debit);
        }


        return $Debit->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
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
            "customer_id"=>"integer",
            "transaction_id"=>"integer",
            "nominal"=>"integer",
            "dueDate"=>"date_format:Y-m-d",
            "information"=>"string",
            "status"=>"string",
            "id"=>"integer",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $Debit = Debit::findOrfail($request->id);

        try{
            $Debit->update($validated);
        }
        catch(\Exception $e){
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }
        return response()->json([
            "message"=>"Data Berhasil Update",
            "data"=>$Debit
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Debit $debit)
    {
        $debit->delete();
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
}
