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
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->string("idDeposit");
            $table->foreignId("customer_id")->constrained("customers")->onDelete("cascade");
            $table->foreignId("transaction_id")->nullable()->constrained("transactions")->onDelete("cascade");
            $table->date('depositDate');
            $table->double('ammount',12,2);
            $table->double('total',12,2);
            $table->string('status');
            $table->string('information');
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
        Schema::dropIfExists('deposits');
    }
};
