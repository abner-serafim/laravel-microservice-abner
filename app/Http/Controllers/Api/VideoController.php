<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Http\Request;

class VideoController extends BasicCrudController
{
    protected bool $useTransaction = false;
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
            'genres_id' => [
                'required',
                'array',
                'exists:genres,id,deleted_at,NULL',
            ],
            'video_file' => 'required'
        ];
    }

    protected function handleRelations($video, Request $request): void
    {

    }

    public function validate(Request $request, array $rules, array $messages = [], array $customAttributes = [])
    {
        $this->addRuleIfGenresHasCategories($request, $rules);
        return parent::validate($request, $rules, $messages, $customAttributes);
    }

    protected function addRuleIfGenresHasCategories(Request $request, array &$rules)
    {
        $categories = $request->get('categories_id');
        $categories = is_array($categories) ? $categories : [];
        $rules['genres_id'][] = new GenresHasCategoriesRule($categories);
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
