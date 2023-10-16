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
        Schema::create('staffs', function (Blueprint $table) {
            $table->id();
            $table->string("id_staff");
            $table->string("name")->unique();
            $table->date("registerDate");
            $table->string("address");
            $table->string("urlImage")->nullable();
            $table->string("phone");
            $table->foreignId("position_id")->constrained("positions")->onDelete("cascade");
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
        Schema::dropIfExists('staffs');
    }
};
