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
        Schema::create('staff_fleet', function (Blueprint $table) {
            $table->id();
            $table->foreignId("staff_id")->constrained("staffs")->onDelete("cascade");
            $table->foreignId("fleet_id")->constrained("fleets")->onDelete("cascade");
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
        Schema::dropIfExists('staff_fleet');
    }
};
