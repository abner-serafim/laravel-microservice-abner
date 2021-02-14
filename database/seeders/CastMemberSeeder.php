<?php

namespace Database\Seeders;

use App\Models\CastMember;
use Illuminate\Database\Seeder;

class CastMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        CastMember::factory(10)->create();
    }
}
