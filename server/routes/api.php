<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\FleetController;
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


    // users related
    Route::apiResource("users", UserController::class);
    Route::apiResource("staffs", StaffContoller::class);
    Route::apiResource("positions", PositionController::class);
    Route::apiResource("suppliers", SupplierController::class);
    Route::apiResource("customers", CustomerController::class);
    Route::apiResource("fleets", FleetController::class);

    Route::prefix("update")->group(function(){
        Route::post('/suppliers',[SupplierController::class,'update']);
        Route::post('/products',[ProductController::class,'update']);
        Route::post('/units',[UnitController::class,'update']);
        Route::post('/restocks',[RestockController::class,'update']);
        Route::post('/returns',[ReturnController::class,'update']);
        Route::post('/fleets',[FleetController::class,'update']);
        Route::post('/deliveries',[DeliveryController::class,'update']);
        Route::post('/staffs',[StaffContoller::class,'update']);
        Route::post('/positions',[PositionController::class,'update']);
        Route::post('/categories',[CategoryController::class,'update']);
        Route::post('/customers',[CustomerController::class,'update']);
        Route::post('/transactions',[TransactionController::class,'update']);
    });
    
    
    // logout
    Route::post("logout", [AuthController::class, "logout"]);
});

Route::post("auth", [AuthController::class, "auth"]);
