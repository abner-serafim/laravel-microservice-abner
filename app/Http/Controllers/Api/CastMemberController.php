<?php

namespace App\Http\Controllers\Api;

use App\Models\CastMember;

class CastMemberController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'name' => 'required|max:255',
            'type' => 'in:' . implode(',', CastMember::ALL_TYPE)
        ];
    }

    protected function getModel(): string
    {
        return CastMember::class;
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
