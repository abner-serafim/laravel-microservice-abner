<?php

namespace App\ModelFilters;


use Illuminate\Database\Eloquent\Builder;

class GenreFilter extends DefaultModelFilter
{
    /**
    * Related Models that have ModelFilters as well as the method on the ModelFilter
    * As [relationMethod => [input_key1, input_key2]].
    *
    * @var array
    */
    public $relations = [];

    protected $sortable = ['name', 'created_at', 'is_active'];

    public function search($search)
    {
        $this->where('name', 'LIKE', "%$search%");
    }

    public function categories($categories)
    {
        $idsOrNomes = explode(",", $categories);
        $this->whereHas('categories', function (Builder $query) use ($idsOrNomes) {
            $query
                ->whereIn('id', $idsOrNomes)
                ->orWhereIn('name', $idsOrNomes);
        });
    }
}
