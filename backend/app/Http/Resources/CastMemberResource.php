<?php

namespace App\Http\Resources;

use App\Models\CastMember;
use Illuminate\Http\Resources\Json\JsonResource;

class CastMemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return parent::toArray($request) + [
            'type_name' => CastMember::ALL_TYPE_NAME[$this->type]
        ];
    }
}
