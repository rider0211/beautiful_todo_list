<?php

return [

    'default' => env('BROADCAST_DRIVER', 'pusher'),

    'connections' => [

        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'us2'),
                'useTLS' => true
            ],
        ],

        // Redis connection for future scalability or as an alternative
        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
        ],

        // Log driver, for local development/testing
        'log' => [
            'driver' => 'log',
        ],

    ],

];
