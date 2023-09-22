<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebitController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\FleetController;
use App\Http\Controllers\historydeliveryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MenugroupController;
use App\Http\Controllers\MenuitemController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\RestockController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StaffContoller;
use App\Http\Controllers\supllierController;
use App\Http\Controllers\supplier2Controller;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Models\historydelivery;
use App\Models\Restock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware("auth:sanctum")->group(function () {

    // dashboard
    Route::get("/dashboard", DashboardController::class);

    // settings
    Route::get("profile", [AuthController::class, "profile"]);

    // settings
    Route::get("settings", [SettingController::class, "index"]);
    Route::patch("settings", [SettingController::class, "update"]);

    // products related
    Route::apiResource("products", ProductController::class);
    Route::apiResource("categories", CategoryController::class);
    Route::apiResource("units", UnitController::class);

    // sales and purchases
    Route::apiResource("restocks", RestockController::class);
    Route::apiResource("returs", ReturnController::class);
    Route::apiResource("deliveries", DeliveryController::class);
    Route::apiResource("transactions", TransactionController::class);
    Route::apiResource("debits", DebitController::class);
    Route::apiResource("deposits", DepositController::class);
    

    // users related
    Route::apiResource("users", UserController::class);
    Route::apiResource("staffs", StaffContoller::class);
    Route::apiResource("positions", PositionController::class);
    Route::apiResource("suppliers", SupplierController::class);
    Route::apiResource("customers", CustomerController::class);
    Route::apiResource("fleets", FleetController::class);
    Route::apiResource("historydeliveries", historydeliveryController::class);
    Route::apiResource("invoices", InvoiceController::class);

    //role Permisison
    Route::apiResource("menugroups", MenugroupController::class);
    Route::apiResource("menuitems", MenuitemController::class);

    Route::prefix("update")->group(function(){
        Route::post('/suppliers',[SupplierController::class,'update']);
        Route::post('/products',[ProductController::class,'update']);
        Route::post('/units',[UnitController::class,'update']);
        Route::post('/restocks',[RestockController::class,'update']);
        Route::post('/returs',[ReturnController::class,'update']);
        Route::post('/fleets',[FleetController::class,'update']);
        Route::post('/deliveries',[DeliveryController::class,'update']);
        Route::post('/staffs',[StaffContoller::class,'update']);
        Route::post('/positions',[PositionController::class,'update']);
        Route::post('/categories',[CategoryController::class,'update']);
        Route::post('/customers',[CustomerController::class,'update']);
        Route::post('/transactions',[TransactionController::class,'update']);
        Route::post('/debits',[DebitController::class,'update']);
        Route::post('/deliveries',[DeliveryController::class,'update']);
        Route::post('/deposits',[DepositController::class,'update']);
        Route::post('/menugroups',[MenugroupController::class,'update']);
        Route::post('/menuitems',[MenuitemController::class,'update']);
    });
    Route::prefix("import")->group(function(){
        Route::post('/suppliers',[SupplierController::class,'import']);
        Route::post('/products',[ProductController::class,'import']);
        Route::post('/units',[UnitController::class,'import']);
        Route::post('/fleets',[FleetController::class,'import']);
        Route::post('/staffs',[StaffContoller::class,'import']);
        Route::post('/positions',[PositionController::class,'import']);
        Route::post('/categories',[CategoryController::class,'import']);
        Route::post('/customers',[CustomerController::class,'import']);
        Route::post('/restocks',[RestockController::class,'import']);
        Route::post('/returs',[ReturnController::class,'import']);
        
    });
    Route::post('/getLatest/deposits',[DepositController::class,'getLatest']);
    
    
    // logout
    Route::post("logout", [AuthController::class, "logout"]);
});

Route::post("auth", [AuthController::class, "auth"]);
