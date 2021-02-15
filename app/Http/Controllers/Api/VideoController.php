<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class VideoController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => 'required|array|exists:genres,id,deleted_at,NULL'
        ];
    }

    /**
     * @param Video $video
     * @param Request $request
     */
    protected function handleRelations($video, Request $request): void
    {
        $video->categories()->sync($request->get('categories_id'));
        $video->genres()->sync($request->get('genres_id'));
    }

    protected function getModel(): string
    {
        return Video::class;
    }

    protected function getRulesStore(): array
    {
        return $this->rules;
    }

    protected function getRulesUpdate(): array
    {
        return $this->rules;
    }
}
