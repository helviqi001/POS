<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Deposit;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class DepositController extends Controller
{
    public $possible_relations = ["customer"];
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

        $Deposit = new Deposit();

        if ($relations) {
            $Deposit = handle_relations($relations, $this->possible_relations, $Deposit);
        }

        // if ($fields) {
        //     $Deposit = handle_fields($fields, $this->possible_fields, $Deposit);
        // }

        if ($search) {
            $Deposit = $Deposit->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $Deposit->paginate($paginate);

        return response()->json([
            "data"=>$Deposit->get()
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
            "idDeposit"=>"integer",
            "customer_id"=>"required|integer",
            "depositDate"=>"required|date_format:Y-m-d",
            "ammount"=>"required|decimal:0,4",
            "total"=>"decimal:0,4",
            "status"=>"required|string",
            "information"=>"required|string",
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>"error nih"
            ],Response::HTTP_BAD_REQUEST);
        }
        do {
            $randomNumber = rand(01, 9999);
            $idDeposit = 'D'.'-'. $randomNumber;
            $existingProduct = Deposit::where('idDeposit', $idDeposit)->first();
        } while ($existingProduct);
        $validated = $validator->validated();
        $validated['idDeposit'] = $idDeposit;
        $existingTotalDeposit = Deposit::where('customer_id', $validated['customer_id'])->sum('ammount');
        $newTotalDeposit = $existingTotalDeposit + $validated['ammount'];
        $validated['total'] = $newTotalDeposit;
        try{
            $newValue= Deposit::create($validated);
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

        $Deposit = new Deposit();

        if ($relations) {
            $Deposit = handle_relations($relations, $this->possible_relations,  $Deposit);
        }


        return $Deposit->findOrFail($id);
    }

    public function getLatest(Request $request)
    {
        $id = $request->id;
        $relations = $request->input("relations");

        $Deposit = new Deposit();

        if ($relations) {
            $Deposit = handle_relations($relations, $this->possible_relations,  $Deposit);
        }

        return $Deposit->where('customer_id', $id)->latest()->first();
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
            "customer_id"=>"integer",
            "depositDate"=>"date_format:Y-m-d",
            "ammount"=>"decimal:0,4",
            "total"=>"decimal:0,4",
            "status"=>"string",
            "information"=>"string",
            "id"=>"integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $Deposit= Deposit::findOrfail($request->id);
        try{
            $ammountDifference = $validated['ammount'] - $Deposit->ammount;

            // Mengambil semua deposit dengan customer_id yang sama dan ID lebih besar
            $sameCustomerDeposits = Deposit::where('customer_id', $Deposit->customer_id)
                ->where('id', '>=', $Deposit->id)
                ->get();
    
            // Update total hanya pada data setelah update
            foreach ($sameCustomerDeposits as $sameCustomerDeposit) {
                $sameCustomerDeposit->total += $ammountDifference;
                $sameCustomerDeposit->save();
            }
    
            $Deposit->update($validated);
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$Deposit
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Deposit $deposit) 
    {
        // Simpan nilai ammount dari data yang akan dihapus
    $ammountToSubtract = $deposit->ammount;

    // Hapus data
    $deposit->delete();

    // Ambil data-data setelah hapus
    $sameCustomerDeposits = Deposit::where('customer_id', $deposit->customer_id)
        ->where('id', '>', $deposit->id)
        ->get();

    // Kurangi total data setelah hapus dengan nilai ammount yang dihapus
    foreach ($sameCustomerDeposits as $sameCustomerDeposit) {
        $sameCustomerDeposit->total -= $ammountToSubtract;
        $sameCustomerDeposit->save();
    }
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
    public function MultipleDelete(Request $request)
    {
        $id = $request->input('id');
        $deposits = Deposit::whereIn('id', $id)->get();
        foreach ($deposits as $deposit) {
            $ammountToSubtract = $deposit->ammount;
            $deposit->delete();
            // Ambil data-data setelah hapus
            $sameCustomerDeposits = Deposit::where('customer_id', $deposit->customer_id)->where('id', '>', $deposit->id)->get();
            // Kurangi total data setelah hapus dengan nilai ammount yang dihapus
            foreach ($sameCustomerDeposits as $sameCustomerDeposit) {
                $sameCustomerDeposit->total -= $ammountToSubtract;
                $sameCustomerDeposit->save();
            }
        }
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
}
