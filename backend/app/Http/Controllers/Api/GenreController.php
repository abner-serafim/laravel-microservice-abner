<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class GenreController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL'
    ];

    /**
     * @param Genre $genre
     * @param Request $request
     */
    protected function handleRelations($genre, Request $request): void
    {
        $genre->categories()->sync($request->get('categories_id'));
    }

    protected function getModel(): string
    {
        return Genre::class;
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
        return GenreResource::class;
    }
}
