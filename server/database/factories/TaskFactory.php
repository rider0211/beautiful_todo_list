<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition()
    {
        $from = $this->faker->dateTimeThisMonth();

        $to = $this->faker->dateTimeBetween($from, $from->modify('+1 month'))->format('Y-m-d');

        return [
            'project_id' => Project::factory(),
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'status' => $this->faker->randomElement([0, 1, 2]),
            'from' => $from,
            'to' => $to,
        ];
    }
}