<?php

namespace Tests\Stubs\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use App\Http\Resources\CategoryResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Tests\Stubs\Models\CategoryStub;

class CategoryControllerStub extends BasicCrudController
{
    protected function getModel(): string
    {
        return CategoryStub::class;
    }

    protected function getRulesStore(): array
    {
        return [
            'name' => 'required|max:255',
            'description' => 'nullable',
        ];
    }

    protected function getRulesUpdate(): array
    {
        return [
            'name' => 'nullable|max:255',
            'description' => 'nullable',
        ];
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
