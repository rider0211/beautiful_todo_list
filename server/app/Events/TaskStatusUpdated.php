<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Facades\Log;

class TaskStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;

    /**
     * Create a new event instance.
     */
    public function __construct(Task $task)
    {
        Log::info('TaskStatusUpdated event dispatched', ['task' => $task]);
        $this->task = $task;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    { 
        return ['task-channel'];
    }

    public function broadcastWith()
    {
        Log::info('Broadcasting task status updated event', ['task' => $this->task]);
        return [
            'task' => $this->task,
        ];
    }

    public function broadcastAs()
    {
        return 'task-status-updated';
    }
}
