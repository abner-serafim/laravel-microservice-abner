<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMember extends Model
{
    use HasFactory, SoftDeletes, Traids\Uuid;

    const TYPE_DIRECTOR = 1;
    const TYPE_ACTOR = 2;
    const ALL_TYPE = [self::TYPE_DIRECTOR, self::TYPE_ACTOR];
    const ALL_TYPE_NAME = [
        self::TYPE_DIRECTOR => 'Diretor',
        self::TYPE_ACTOR => 'Ator'
    ];

    protected $fillable = ['name', 'type'];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'type' => 'integer'
    ];

    public $incrementing = false;
}
