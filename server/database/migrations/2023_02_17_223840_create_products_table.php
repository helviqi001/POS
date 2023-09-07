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
            $table->string("idProduk");
            $table->string("name")->unique();
            $table->string("urlImage")->nullable();
            $table->integer("stock");
            $table->double("margin",12,2);
            $table->double("tax",12,2);
            $table->double("sellingPrice",12,2);
            $table->double("discount",12,2);
            $table->double("netPrice",12,2);
            $table->integer("coli");
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
