<?php

namespace App\Http\Controllers;

use App\Models\Debit;
use App\Models\Delivery;
use App\Models\Deposit;
use App\Models\Product;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public $possible_relations = ["staff","customer","products"] ; 
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
            "idTransaction"=>"string",
            "staff_id"=>"required|integer",
            "customer_id"=>"required|integer",
            "product_id"=>"required|array",
            "product_id.*.id"=>"required|integer",
            "product_id.*.quantity"=>"required|integer",
            "total"=>"required|integer",
            "paymentStatus"=>"string",
            "itemStatus"=>"string",
            "information"=>"string",
            "transactionDate"=>"required|date_format:Y-m-d",
        ]);
        if($validator->fails()){
            return response()->json([
                "error"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validate();
        $products = $this->convert_array($validated["product_id"]);
        do {
            $randomNumber = rand(01, 9999);
            $staff = Staff::find($request->staff_id);
            $staffname = $staff->name;
            $idTransaction = $staffname .'-'. $randomNumber;
            $existingProduct = Transaction::where('idTransaction', $idTransaction)->first();
        } while ($existingProduct);
        $validated['idTransaction'] = $idTransaction;
        try{
            $newValue= Transaction::create([
                'idTransaction'=>$validated['idTransaction'],
                'staff_id'=>$validated['staff_id'],
                'customer_id'=>$validated['customer_id'],
                'total'=>$validated['total'],
                'paymentStatus'=>$validated['paymentStatus'],
                'itemStatus'=>$validated['itemStatus'],
                'information'=>$validated['information'],
                'transactionDate'=>$validated['transactionDate'],
            ]);
            $newValue->products()->sync($products);  
            foreach ($products as $key => $product) {
                $productModel = Product::firstWhere("id",$key);
                $productModel->stock -= $product['quantity'];
                $productModel->save(); 
            }
            if ($validated['paymentStatus'] === 'debit') {
                $installments = $request->input('installment'); // Get the number of installments
            
                // Calculate the due date for the first installment
                $dueDate = $validated['transactionDate'];
            
                for ($i = 1; $i <= $installments; $i++) {
                    $dueDate = date('Y-m-d', strtotime($dueDate . ' +1 month'));
                    $debit = new Debit();
                    $debit->customer_id = $validated['customer_id'];
                    $debit->transaction_id = $newValue->id; // Assign the transaction_id
                    $debit->nominal = $validated['total'] / $installments;
                    $debit->dueDate = $dueDate;
                    $debit->information = 'Installment ' . $i;
                    $debit->status = "Not Paid Off";
                    $debit->save();
                }
            }
            if ($validated['paymentStatus'] === 'deposit') {
                $Deposit = Deposit::where('customer_id', $validated['customer_id'])->latest()->first();
                do {
                    $randomNumber = rand(01, 9999);
                    $idDeposit = 'D'.'-'. $randomNumber;
                    $existingProduct = Deposit::where('idDeposit', $idDeposit)->first();
                } while ($existingProduct);
                    $debit = new Deposit();
                    $debit->idDeposit = $idDeposit;
                    $debit->customer_id = $validated['customer_id'];
                    $debit->transaction_id = $newValue->id;
                    $debit->depositDate = $validated['transactionDate'];
                    $debit->ammount = $validated['total'];
                    $debit->total = $Deposit->total - $validated['total'];
                    $debit->status = 'Payment';
                    $debit->information = 'Payment' . $newValue->idTransaction;
                    $debit->save();
                }
            if ($validated['itemStatus'] === 'delivery') {
                $fleet_id = $request->input('fleet_id'); 
                $status = "in Waiting"; 
                $information = $request->input('informationDelivery'); 
                do {
                    $randomNumber = rand(01, 9999);
                    $idDelivery = "D" .'-'. $randomNumber;
                    $existingProduct = Delivery::where('idDelivery', $idDelivery)->first();
                } while ($existingProduct);

                $delivery = new Delivery();
                $delivery->idDelivery = $idDelivery;
                $delivery->transaction_id = $newValue->id;
                $delivery->fleet_id = $fleet_id;
                $delivery->status = $status;
                $delivery->information = $information;
                $delivery->save();
            }
        }
        catch(\Exception $e){
            return $e;
        }

        return response()->json([
            "message"=>"transaction successful",
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
            "idTransaction"=>"string",
            "staff_id"=>"integer",
            "customers_id"=>"integer",
            "product_id"=>"array",
            "product_id.*.id"=>"integer",
            "product_id.*.quantity"=>"integer",
            "total"=>"integer",
            "paymentStatus"=>"string",
            "itemStatus"=>"string",
            "information"=>"string",
            "transactionDate"=>"date_format:Y-m-d",
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
        $products = $this->convert_array($validated["product_id"]);
        try{
            $transaction = Transaction::findOrfail($request->id);
            foreach ($products as $key => $product) {
                $productModel = Product::firstWhere("id",$key);
                $oldQuantity = $transaction->products()->where('product_id', $key)->first()->pivot->quantity;
                
                $productModel->stock -= $oldQuantity;
                $productModel->stock += $product['quantity'];
                $productModel->save(); 
            }
            $transaction->update([
                'idTransaction'=>$validated['id_transaction'],
                'staff_id'=>$validated['staff_id'],
                'customers_id'=>$validated['customers_id'],
                'total'=>$validated['total'],
                'paymentStatus'=>$validated['paymentStatus'],
                'itemStatus'=>$validated['itemStatus'],
                'information'=>$validated['information'],
                'transactionDate'=>$validated['transaction_date'],
            ]);
            $transaction->products()->sync($products);  
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
        $pivottransaction =$transaction->products;
        foreach($pivottransaction as $product){
            $productModel = Product::findOrFail($product['id']);
                $oldQuantity =$transaction->products()->where('product_id', $product['id'])->first()->pivot->quantity;
                $productModel->stock += $oldQuantity;
                $oldColi =$transaction->products()->where('product_id', $product['id'])->first()->pivot->coli;
                $productModel->coli += $oldColi;
                $productModel->save(); 
        }
        if($transaction->itemStatus === 'delivery'){
            $delivery = Delivery::firstWhere('transaction_id',$transaction->id);
            $delivery->delete();
        }
        if($transaction->paymentStatus === 'debit'){
            $debits = Debit::where('transaction_id', $transaction->id)->get();
        
            // Menghapus setiap entitas Debit
            foreach ($debits as $debit) {
                $debit->delete();
            }
        }
        // if($transaction->paymentStatus === 'deposit'){
        //     $debit = Deposit::firstWhere('transaction_id',$transaction->id);
        //     $debit->delete();
        // }
        $transaction->delete();
        return response()->json([
            "message"=>"data berhasil di delete"
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
}
