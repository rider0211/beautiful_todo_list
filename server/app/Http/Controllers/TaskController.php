<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Events\TaskStatusUpdated;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string',
            'description' => 'string',
            'status' => 'required|in:0,1,2',
            'from' => 'required|date',
            'to' => 'required|date',
        ]);

        $task = Task::create($request->all());
        return response()->json($task, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $task->status = $request->status;
        $task->save();
        broadcast(new TaskStatusUpdated($task));
        return response()->json($task);

    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:0,1,2',
            'from' => 'sometimes|date',
            'to' => 'sometimes|date|after:from'
        ]);

        $task = Task::findOrFail($id);

        $task->update($request->only(['title', 'description', 'status', 'from', 'to']));

        return response()->json($task, 200);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(null, 204);
    }

    public function deleteSelected(Request $request)
    {
        $taskIds = $request->input('ids');

        if (!$taskIds || !is_array($taskIds)) {
            return response()->json(['error' => 'Invalid input, expected an array of task IDs.'], 400);
        }
        Task::whereIn('id', $taskIds)->delete();

        return response()->json(['message' => 'Selected tasks have been deleted.'], 200);
    }
}
