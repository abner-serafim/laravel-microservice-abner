<?php

namespace App\Http\Controllers\Api;

use App\Models\Genre;

class GenreController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean'
    ];

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
}
