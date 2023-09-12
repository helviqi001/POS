<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('restocks', function (Blueprint $table) {
            $table->id();
            $table->date("restockDate");
            $table->integer("totalSpend");
            $table->foreignId("supplier_id")->constrained("suppliers")->onDelete("cascade");
            $table->timestamps();
        });

        // Schema::table('products',function (Blueprint $table) {
        //     $table->foreignId("restock_id")->constrained("restocks")->onDelete("cascade");
    
        // });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('restocks');
    }
};
