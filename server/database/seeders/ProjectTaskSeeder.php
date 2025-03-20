<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;

class ProjectTaskSeeder extends Seeder
{
    public function run()
    {
        Project::factory()
            ->count(12)
            ->hasTasks(5)
            ->create();
    }
}
