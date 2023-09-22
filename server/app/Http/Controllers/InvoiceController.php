<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public $possible_relations = ["transaction.products","transaction.staff","transaction","transaction.customer"];
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

        $invoice = new Invoice();

        if ($relations) {
            $invoice = handle_relations($relations, $this->possible_relations, $invoice);
        }

        if ($search) {
            $invoice = $invoice->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $invoice->paginate($paginate);

        return response()->json([
            "data"=>$invoice->get()
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
        $transactionId=  $request->input('transactionId');
        $currentDate = now();
        $invoiceNumber = Invoice::count() + 1;
        $date = $currentDate->format('Y-m-d');
        $invoiceId = $currentDate->format('Ymd') . '-' . str_pad($invoiceNumber, 4, '0', STR_PAD_LEFT);

        // Simpan data invoice dengan invoiceId ke dalam tabel
        $newValue = Invoice::create([
            "date"=>$date,
            'invoiceId' => $invoiceId,
            'transaction_id' =>$transactionId,
        ]);
        return response()->json([
            "message"=>"Invoice successful created",
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

        $invoice = new Invoice();

        if ($relations) {
            $invoice = handle_relations($relations, $this->possible_relations,  $invoice);
        }

        return $invoice->where('transaction_id', $id)->latest()->first();
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
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
