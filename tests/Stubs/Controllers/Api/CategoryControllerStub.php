<?php

namespace Tests\Stubs\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Database\Eloquent\Model;
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
}
