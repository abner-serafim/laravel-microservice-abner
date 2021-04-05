<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\VideoResource;
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
            'year_launched' => 'required|date_format:Y|min:1800',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer|min:1',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => [
                'required',
                'array',
                'exists:genres,id,deleted_at,NULL',
            ],
            'cast_members_id' => [
                'required',
                'array',
                'exists:cast_members,id,deleted_at,NULL',
            ],
            'thumb_file' => 'image|max:' . Video::FILE_MAX_SIZE_THUMB,
            'banner_file' => 'image|max:' . Video::FILE_MAX_SIZE_BANNER,
            'trailer_file' => 'mimetypes:video/mp4|max:' . Video::FILE_MAX_SIZE_TRAILER,
            'video_file' => 'mimetypes:video/mp4|max:' . Video::FILE_MAX_SIZE_VIDEO,
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

    protected function getResourceCollection(): string
    {
        return $this->getResource();
    }

    protected function getResource(): string
    {
        return VideoResource::class;
    }
}
