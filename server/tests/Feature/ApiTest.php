<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase; // Reset the database after each test

    /**
     * Test GET /api/projects
     *
     * @return void
     */
    public function test_get_projects()
    {
        // Test 1: Successful request with data in the database
        $project = \App\Models\Project::factory()->create(); // Create a project

        $response = $this->get('/api/projects');

        $response->assertStatus(200); // Assert HTTP 200 status
    }

    /**
     * Test POST /api/projects
     *
     * @return void
     */
    public function test_create_project()
    {
        // Test 1: Successful project creation
        $data = [
            'name' => 'New Project',
            'description' => 'A new project description',
        ];

        $response = $this->postJson('/api/projects', $data);

        $response->assertStatus(201); // Assert HTTP 201 Created status
        $response->assertJsonFragment([
            'name' => 'New Project',
            'description' => 'A new project description',
        ]);

        // Test 2: Ensure the project was created in the database
        $this->assertDatabaseHas('projects', [
            'name' => 'New Project',
            'description' => 'A new project description',
        ]);

        // Test 3: Validation errors (e.g., missing required fields)
        $invalidData = [
            'name' => '', // Empty name should fail
            'description' => '', // Empty description should fail
        ];

        $response = $this->postJson('/api/projects', $invalidData);

        $response->assertStatus(422); // Assert HTTP 400 Unprocessable Entity status for validation errors
        $response->assertJsonValidationErrors(['name', 'description']); // Ensure both name and description are marked as invalid
    }
}
