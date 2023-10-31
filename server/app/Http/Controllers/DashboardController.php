<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Purchase;
use App\Models\Restock;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{

    public function __invoke(Request $request)
    {
        $startDay = Carbon::parse($request->input('startDate'));
        $endDate = Carbon::parse($request->input('endDate'));
        $flag = $request->input('flag');

        $transactionDataPerDay = [];
        $restockDataPerDay = [];

        $productSalesPeriode = Product::select('products.id', 'products.name', DB::raw('SUM(pt1.quantity) as total_quantity_sold'))
        ->join('product_transaction as pt1', 'products.id', '=', 'pt1.product_id')
        ->join('transactions', 'pt1.transaction_id', '=', 'transactions.id')
        ->whereBetween('transactions.transactionDate', [$startDay, $endDate])
        ->groupBy('products.id', 'products.name')
        ->orderByDesc('total_quantity_sold')
        ->take(10)
        ->get();
        $productSalesPeriode = $productSalesPeriode->pluck('total_quantity_sold', 'name');


        $productSalesAllTime = Product::select('products.id', 'products.name', DB::raw('SUM(pt1.quantity) as total_quantity_sold'))
        ->join('product_transaction as pt1', 'products.id', '=', 'pt1.product_id')
        ->groupBy('products.id', 'products.name')
        ->orderByDesc('total_quantity_sold')
        ->take(10)
        ->get();
        $productSalesAllTime = $productSalesAllTime->pluck('total_quantity_sold', 'name');

        $product = Product::count();

        $income = Transaction::whereBetween('transactionDate',[$startDay,$endDate])->sum('total');      

        $expense = Restock::whereBetween('restockDate',[$startDay,$endDate])->sum('totalSpend');

        $totalQuantitySold = DB::table('product_transaction') // Gantilah dengan nama tabel pivot yang sesuai
        ->join('transactions', 'product_transaction.transaction_id', '=', 'transactions.id')
        ->whereBetween('transactions.transactionDate', [$startDay, $endDate])
        ->sum('product_transaction.quantity');
        if($flag === 4 ){
            while ($startDay->lte($endDate)) {
                $currentDay = $startDay->format('Y-m-d');
            
                // Loop melalui setiap jam dalam sehari
                for ($hour = 0; $hour <= 23; $hour++) {
                    $currentHour = sprintf('%02d:00', $hour); // Format jam menjadi dua digit (misal: 01, 02, dst.)
            
                    // Inisialisasi total transaksi untuk jam ini
                    $totalTransactionForHour = 0;
            
                    // Cek apakah ada transaksi pada jam ini
                    $transactionsForHour = Transaction::whereDate('transactionDate', $currentDay)
                        ->whereRaw("HOUR(transactionDate) = ?", [$currentHour])
                        ->get();
            
                    // Hitung total transaksi untuk jam ini
                    foreach ($transactionsForHour as $transaction) {
                        $totalTransactionForHour += $transaction->total;
                    }
            
                    // Simpan total transaksi untuk jam ini dalam array
                    $transactionDataPerDay[$currentHour] = $totalTransactionForHour;


                    $totalRestockForHour = 0;
            
                    // Cek apakah ada transaksi pada jam ini
                    $transactionsForHour = Restock::whereDate('restockDate', $currentDay)
                        ->whereRaw("HOUR(restockDate) = ?", [$currentHour])
                        ->get();
            
                    // Hitung total transaksi untuk jam ini
                    foreach ($transactionsForHour as $Restock) {
                        $totalRestockForHour += $Restock->totalSpend;
                    }
            
                    // Simpan total transaksi untuk jam ini dalam array
                    $restockDataPerDay[$currentHour] = $totalRestockForHour;
                }
            
                // Lanjutkan ke hari berikutnya
                $startDay->addDay();
            }
        };

        if($flag === 3){
            while ($startDay->lte($endDate)) {
                $totalTransactionForDay = Transaction::whereDate('transactionDate', $startDay)->sum('total');
                $totalRestockForDay = Restock::whereDate('restockDate', $startDay)->sum('totalSpend');
                $transactionDataPerDay[$startDay->format('Y-m-d')] = $totalTransactionForDay;
                $restockDataPerDay[$startDay->format('Y-m-d')] = $totalRestockForDay;
                $startDay->addDay();
            }
        }
        if($flag === 2){
            while ($startDay->lte($endDate)) {
                $totalTransactionForDay = Transaction::whereMonth('transactionDate', $startDay)->sum('total');
                $totalRestockForDay = Restock::whereMonth('restockDate', $startDay)->sum('totalSpend');
                $transactionDataPerDay[$startDay->format('Y-m')] = $totalTransactionForDay;
                $restockDataPerDay[$startDay->format('Y-m')] = $totalRestockForDay;
                $startDay->addDay();
            }
        }
        if($flag === 1){
            while ($startDay->lte($endDate)) {
                $totalTransactionForDay = Transaction::whereYear('transactionDate', $startDay)->sum('total');
                $totalRestockForDay = Restock::whereYear('restockDate', $startDay)->sum('totalSpend');
                $transactionDataPerDay[$startDay->format('Y')] = $totalTransactionForDay;
                $restockDataPerDay[$startDay->format('Y')] = $totalRestockForDay;
                $startDay->addDay();
            }
        }
        

        return [
            "transactionDay" => $transactionDataPerDay,
            "expenseDay" => $restockDataPerDay,
            "SalesProductPeriode"=>$productSalesPeriode,
            "SalesProductAllTime"=>$productSalesAllTime,
            "Product"=>$product ,
            "Income"=>$income ,
            "Expense"=>$expense ,
            "quantitySold"=>$totalQuantitySold ,
        ];
    }
}
