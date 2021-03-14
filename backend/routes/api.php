<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['namespace' => 'App\Http\Controllers\Api', 'as' => 'api.'], function () {
    $default = ['except' => ['create', 'edit']];

    Route::resource('cast_members', 'CastMemberController', $default);
    Route::resource('categories', 'CategoryController', $default);
    Route::resource('genres', 'GenreController', $default);
    Route::resource('videos', 'VideoController', $default);
});