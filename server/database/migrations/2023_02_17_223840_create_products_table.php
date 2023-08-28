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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("urlImage")->nullable();
            $table->integer("stock");
            $table->double("costOfGoodsSold");
            $table->double("tax");
            $table->double("sellingPrice");
            $table->double("discount");
            $table->double("netPrice");
            $table->double("coli");
            $table->string("information");
            $table->foreignId("unit_id")->constrained("units")->onDelete("cascade");
            $table->foreignId("supplier_id")->constrained("suppliers")->onDelete("cascade");
            $table->foreignId("category_id")->constrained("categories")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
};
