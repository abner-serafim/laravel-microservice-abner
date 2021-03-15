<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'description' => 'nullable',
        'is_active' => 'boolean'
    ];

    protected function getModel(): string
    {
        return Category::class;
    }

    protected function getRulesStore(): array
    {
        return $this->rules;
    }

    protected function getRulesUpdate(): array
    {
        return $this->rules;
    }

    protected function handleRelations($obj, Request $request): void
    {

    }

    protected function getResourceCollection(): string
    {
        return $this->getResource();
    }

    protected function getResource(): string
    {
        return CategoryResource::class;
    }
}
