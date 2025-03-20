<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::select('projects.id', 'projects.name', 'projects.description', 'projects.created_at', 'projects.updated_at')
        ->leftJoin('tasks', 'tasks.project_id', '=', 'projects.id')
        ->selectRaw('IFNULL(SUM(tasks.status = 2), 0) / IFNULL(COUNT(tasks.id), 1) * 100 AS task_progress')
        ->groupBy('projects.id', 'projects.name', 'projects.description', 'projects.created_at', 'projects.updated_at')
        ->get();


        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
        ]);

        $project = Project::create($request->all());
        return response()->json($project, 201);
    }

    public function show($id)
    {
        $project = Project::with('tasks')->findOrFail($id);
        return response()->json($project);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        return response()->json(null, 204);
    }

    public function deleteSelected(Request $request)
    {
        $projectIds = $request->input('ids');

        if (!$projectIds || !is_array($projectIds)) {
            return response()->json(['error' => 'Invalid input, expected an array of project IDs.'], 400);
        }

        Project::whereIn('id', $projectIds)->delete();

        return response()->json(['message' => 'Selected projects have been deleted.'], 200);
    }

    public function update(Request $request, $id)
    {
        // Find the project by ID or fail if not found
        $project = Project::findOrFail($id);

        // Validate the input (you can add validation rules based on your needs)
        $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
        ]);

        // Update the project with the validated data
        $project->update($request->only(['name', 'description']));

        // Return the updated project
        return response()->json($project, 200);
    }
}
