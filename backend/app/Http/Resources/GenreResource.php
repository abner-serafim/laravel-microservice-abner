<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GenreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $route = substr(route('api.genres.index'), -11);
        $array = strpos($request->getPathInfo(), $route) === false ? [] : [
            'categories' => CategoryResource::collection($this->categories)
        ];
        return parent::toArray($request) + $array;
    }
}
