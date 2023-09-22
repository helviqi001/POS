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
        Schema::create('historydeliveries', function (Blueprint $table) {
            $table->id();
            $table->string("idDelivery");
            $table->foreignId("fleet_id")->constrained("fleets")->onDelete("cascade");
            $table->foreignId("transaction_id")->constrained("transactions")->onDelete("cascade");
            $table->dateTime("deliveryDate")->nullable();
            $table->dateTime("deliveredDate")->nullable();
            $table->string("status");
            $table->string("information");
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
        Schema::dropIfExists('historydeliveries');
    }
};
