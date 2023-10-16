<?php

namespace App\Console;

use App\Models\Customer;
use App\Models\Debit;
use App\Models\Notification;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
         // Pengiriman notifikasi ulang tahun setiap hari
        $schedule->call(function () {
            $dueDate3 = now()->addDays(3);
            $birthdue3days = Customer::whereMonth('birthDate', $dueDate3->format('m'))
                ->whereDay('birthDate', $dueDate3->format('d'))
                ->get();
            // Kirim notifikasi ke React untuk setiap item yang akan jatuh tempo dalam 3 hari
            $today = now();
            $birthdays = Customer::whereMonth('birthDate', $today->format('m'))
                ->whereDay('birthDate', $today->format('d'))
                ->get();

            foreach ($birthdue3days as $birth3day) {
                Notification::create([
                    'title' => $birth3day->name."'s BirthDay!!",
                    'description' => 'your customer birthday is only 3 days away',
                    'avatar' => null,
                    'type' => 'birthday',
                    'isUnread' => true,
                ]);
            }
            foreach ($birthdays as $birthday) {
                Notification::create([
                    'title' => $birthday->name."'s BirthDay!!",
                    'description' => 'it`s your customer birthday Now!',
                    'avatar' => null,
                    'type' => 'birthday',
                    'isUnread' => true,
                ]);
            }
        })->dailyAt('11:00');


        // Pengiriman notifikasi due date peminjaman
        $schedule->call(function () {
            // Peringatan 7 hari sebelum due date
            $dueDate7 = now()->addDays(7);
            $itemsDue7Days = Debit::whereHas('customer',function($query) use($dueDate7){
                $query-> whereDate('dueDate', $dueDate7);
            })->get();
            // Kirim notifikasi ke React untuk setiap item yang akan jatuh tempo dalam 7 hari
            foreach ($itemsDue7Days as $itemsDue7Day) {
                Notification::create([
                    'title' => $itemsDue7Day->customer->name."'s Credit due Date!!",
                    'description' => 'your customer credit Due Date is only 7 days away',
                    'avatar' => null,
                    'type' => 'credit',
                    'isUnread' => true,
                ]);
            }

            // Peringatan 3 hari sebelum due date
            $dueDate3 = now()->addDays(3);
            $itemsDue3Days = Debit::whereHas('customer',function($query) use($dueDate3){
                $query-> whereDate('dueDate', $dueDate3);
            })->get();
            // Kirim notifikasi ke React untuk setiap item yang akan jatuh tempo dalam 3 hari
            foreach ($itemsDue3Days as $itemsDue3Day) {
                Notification::create([
                    'title' => $itemsDue3Day->customer->name."'s Credit due Date!!",
                    'description' => 'your customer credit Due Date is only 3 days away',
                    'avatar' => null,
                    'type' => 'credit',
                    'isUnread' => true,
                ]);
            }

            // Peringatan 1 hari sebelum due date
            $dueDate1 = now()->addDay();
            $itemsDue1Days = Debit::whereHas('customer',function($query) use($dueDate1){
                $query-> whereDate('dueDate', $dueDate1);
            })->get();
            // Kirim notifikasi ke React untuk setiap item yang akan jatuh tempo dalam 1 hari
            foreach ($itemsDue1Days as $itemsDue1Day) {
                Notification::create([
                    'title' => $itemsDue1Day->customer->name."'s Credit due Date!!",
                    'description' => 'your customer credit Due Date is Tomorrow',
                    'avatar' => null,
                    'type' => 'credit',
                    'isUnread' => true,
                ]);
            }

            $today = now()->date();
            $itemsDueDays = Debit::whereHas('customer',function($query) use($today){
                $query-> whereDate('dueDate', $today);
            })->get();
            foreach ($itemsDueDays as $itemsDueDay) {
                Notification::create([
                    'title' => $itemsDueDay->customer->name."'s Credit due Date!!",
                    'description' => 'your customer credit Due Date Now',
                    'avatar' => null,
                    'type' => 'credit',
                    'isUnread' => true,
                ]);
            }
        })->dailyAt('11:00');
    }

    public function scheduleTimezone(){
        return 'Asia/Jakarta';
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
